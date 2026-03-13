// Edge Function: admin-operations
// Maneja todas las operaciones administrativas con privilegios elevados
// Reemplaza el uso de SERVICE_ROLE_KEY en el frontend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface IssueRequest {
  action: 'issue_certificate'
  data: {
    studentId: string
    courseId: string
    studentName: string
    courseTitle: string
    grade: number
    completionDate?: string
  }
}

interface SaveCourseRequest {
  action: 'save_course'
  data: {
    course: any
    lessons: any[]
    evaluations: any[]
    editingCourse?: boolean
  }
}

interface SaveTeacherRequest {
  action: 'save_teacher'
  data: {
    teacher: any
    editingTeacher?: boolean
  }
}

interface SaveUserRequest {
  action: 'save_user'
  data: {
    userData: any
    editingUser?: any
  }
}

interface DeleteRequestType {
  action: 'delete_resource'
  data: {
    type: 'course' | 'user' | 'teacher' | 'certificate'
    id: string
    userId?: string  // for auth user deletion
  }
}

interface ToggleActiveRequest {
  action: 'toggle_active'
  data: {
    type: 'course' | 'user' | 'teacher'
    id: string
    is_active: boolean
  }
}

type AdminRequest = IssueRequest | SaveCourseRequest | SaveTeacherRequest | SaveUserRequest | DeleteRequestType | ToggleActiveRequest

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear client admin con SERVICE_ROLE_KEY (solo del lado del servidor)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar autenticación del usuario
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear client regular para verificar el token del usuario
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario sea admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parsear request
    const { action, data }: AdminRequest = await req.json()

    console.log(`🔐 [Admin Operations] Action: ${action} by user: ${user.email}`)

    // Ejecutar operación según el action
    switch (action) {
      case 'issue_certificate': {
        const {
          studentId,
          courseId,
          studentName,
          courseTitle,
          grade,
          completionDate = new Date().toISOString().split('T')[0]
        } = data

        console.log('🎓 [Admin] Issuing certificate:', { studentId, courseId })

        // Generar hash para el certificado
        const { data: hashData, error: hashError } = await supabaseAdmin.rpc(
          'generate_certificate_hash'
        )

        if (hashError) {
          throw new Error('Could not generate certificate hash')
        }

        const hash = hashData as string

        // Insertar certificado
        const { data: certificate, error: certError } = await supabaseAdmin
          .from('certificates')
          .insert([{
            student_id: studentId,
            course_id: courseId,
            hash,
            student_name: studentName,
            course_title: courseTitle,
            completion_date: completionDate,
            grade,
            status: 'active',
            pdf_generated: false,
            pdf_url: null
          }])
          .select()
          .single()

        if (certError) {
          throw new Error(`Certificate insertion failed: ${certError.message}`)
        }

        return new Response(
          JSON.stringify({ success: true, certificate }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'save_course': {
        const { course, lessons, evaluations, editingCourse } = data

        console.log('📚 [Admin] Saving course:', { courseId: course.id, title: course.title })

        // Guardar/actualizar curso
        let courseResult
        if (editingCourse) {
          const { data, error } = await supabaseAdmin
            .from('courses')
            .update({
              title: course.title,
              slug: course.slug,
              description: course.description,
              full_description: course.fullDescription,
              image: course.image,
              instructor_id: course.instructorId,
              price: course.price,
              duration: course.duration,
              level: course.level,
              certified: course.certified,
              category: course.category,
              updated_at: new Date().toISOString()
            })
            .eq('id', course.id)

          if (error) throw error
          courseResult = { id: course.id }
        } else {
          const { data, error } = await supabaseAdmin
            .from('courses')
            .insert([{
              title: course.title,
              slug: course.slug,
              description: course.description,
              full_description: course.fullDescription,
              image: course.image,
              instructor_id: course.instructorId,
              price: course.price,
              duration: course.duration,
              level: course.level,
              certified: course.certified,
              category: course.category
            }])
            .select('id')

          if (error) throw error
          courseResult = data[0]
        }

        const courseId = courseResult.id

        // Guardar lecciones
        if (lessons && lessons.length > 0) {
          if (editingCourse) {
            await supabaseAdmin.from('lessons').delete().eq('course_id', courseId)
          }

          const lessonsToInsert = lessons.map((lesson: any, index: number) => ({
            course_id: courseId,
            order_index: index + 1,
            title: lesson.title,
            duration: lesson.duration,
            type: lesson.type || 'video',
            youtube_id: lesson.youtubeId || null,
            description: lesson.description || null,
            content: lesson.content || null
          }))

          const { error: lessonsError } = await supabaseAdmin
            .from('lessons')
            .insert(lessonsToInsert)

          if (lessonsError) {
            console.error('Error saving lessons:', lessonsError)
          }
        }

        // Guardar evaluaciones
        if (evaluations && evaluations.length > 0) {
          if (editingCourse) {
            await supabaseAdmin.from('evaluations').delete().eq('course_id', courseId)
          }

          const evaluationsToInsert = evaluations.map((q: any, index: number) => ({
            course_id: courseId,
            question_order: index + 1,
            question: q.question,
            options: q.options,
            correct_answer: q.correctAnswer,
            explanation: q.explanation || null
          }))

          const { error: evalError } = await supabaseAdmin
            .from('evaluations')
            .insert(evaluationsToInsert)

          if (evalError) {
            console.error('Error saving evaluations:', evalError)
          }
        }

        return new Response(
          JSON.stringify({ success: true, courseId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'save_teacher': {
        const { teacher, editingTeacher } = data

        console.log('👨‍🏫 [Admin] Saving teacher:', { teacherId: teacher.id, name: teacher.full_name })

        if (editingTeacher) {
          // Actualizar teacher existente
          const { error } = await supabaseAdmin
            .from('teachers')
            .update({
              full_name: teacher.full_name,
              email: teacher.email,
              bio: teacher.bio,
              specialization: teacher.specialization,
              years_of_experience: teacher.years_of_experience,
              updated_at: new Date().toISOString()
            })
            .eq('id', teacher.id)

          if (error) throw error
        } else {
          // Crear nuevo teacher
          const { error } = await supabaseAdmin
            .from('teachers')
            .insert([{
              user_id: teacher.user_id,
              full_name: teacher.full_name,
              email: teacher.email,
              bio: teacher.bio,
              specialization: teacher.specialization,
              years_of_experience: teacher.years_of_experience || 0,
              rating: 0,
              total_students: 0,
              total_courses: 0,
              is_active: true
            }])

          if (error) throw error
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'save_user': {
        const { userData, editingUser } = data

        console.log('👤 [Admin] Saving user:', { userId: editingUser?.id, email: userData.email })

        if (editingUser) {
          // Actualizar usuario existente
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              full_name: userData.full_name,
              role: userData.role,
              country: userData.country,
              phone: userData.phone,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingUser.id)

          if (updateError) throw updateError

          // Si cambió a rol profesor, crear/actualizar registro en teachers
          if (userData.role === 'instructor') {
            const { data: existingTeacher } = await supabaseAdmin
              .from('teachers')
              .select('id')
              .eq('user_id', editingUser.id)
              .single()

            if (!existingTeacher) {
              // Crear registro de teacher
              const { error: teacherError } = await supabaseAdmin.from('teachers').insert({
                user_id: editingUser.id,
                full_name: userData.full_name,
                email: userData.email,
                bio: userData.bio || '',
                specialization: userData.specialization || '',
                years_of_experience: 0,
                rating: 0,
                total_students: 0,
                total_courses: 0,
                is_active: true
              })
              if (teacherError) throw teacherError
            } else {
              // Actualizar registro de teacher existente
              const { error: updateTeacherError } = await supabaseAdmin
                .from('teachers')
                .update({
                  full_name: userData.full_name,
                  bio: userData.bio || '',
                  specialization: userData.specialization || '',
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', editingUser.id)
              if (updateTeacherError) throw updateTeacherError
            }
          }
        } else {
          // Crear nuevo usuario
          if (!userData.password) {
            throw new Error('Password required for new users')
          }

          // Crear usuario en auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              full_name: userData.full_name
            }
          })

          if (authError) throw authError
          if (!authData.user) throw new Error('Could not create user')

          // Crear perfil
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: userData.email,
              full_name: userData.full_name,
              role: userData.role,
              country: userData.country,
              phone: userData.phone
            })

          if (profileError) throw profileError

          // Si es profesor, crear registro en teachers
          if (userData.role === 'instructor') {
            const { error: teacherError } = await supabaseAdmin.from('teachers').insert({
              user_id: authData.user.id,
              full_name: userData.full_name,
              email: userData.email,
              bio: userData.bio || '',
              specialization: userData.specialization || '',
              years_of_experience: 0,
              rating: 0,
              total_students: 0,
              total_courses: 0,
              is_active: true
            })
            if (teacherError) throw teacherError
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_resource': {
        const { type, id, userId } = data

        console.log(`🗑️ [Admin] Deleting ${type}:`, { id, userId })

        switch (type) {
          case 'course': {
            // Eliminar lecciones y evaluaciones del curso
            await supabaseAdmin.from('lessons').delete().eq('course_id', id)
            await supabaseAdmin.from('evaluations').delete().eq('course_id', id)
            
            // Eliminar el curso
            const { error } = await supabaseAdmin
              .from('courses')
              .delete()
              .eq('id', id)

            if (error) throw error
            break
          }

          case 'certificate': {
            const { error } = await supabaseAdmin
              .from('certificates')
              .delete()
              .eq('id', id)

            if (error) throw error
            break
          }

          case 'user': {
            if (!userId) throw new Error('userId required for user deletion')

            // Eliminar perfil primero
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .delete()
              .eq('id', userId)

            if (profileError) {
              console.warn('Profile deletion error (might already be deleted):', profileError)
            }

            // Eliminar usuario de auth
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
            if (authError) throw authError
            break
          }

          case 'teacher': {
            const { error } = await supabaseAdmin
              .from('teachers')
              .delete()
              .eq('id', id)

            if (error) throw error
            break
          }

          default:
            throw new Error('Unknown deletion type')
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'toggle_active': {
        const { type, id, is_active } = data

        console.log(`🔄 [Admin] Toggle active ${type} (${id}): ${is_active}`)

        switch (type) {
          case 'course': {
            const { error } = await supabaseAdmin
              .from('courses')
              .update({ is_active, updated_at: new Date().toISOString() })
              .eq('id', id)
            if (error) throw error
            break
          }
          case 'teacher': {
            const { error } = await supabaseAdmin
              .from('teachers')
              .update({ is_active, updated_at: new Date().toISOString() })
              .eq('id', id)
            if (error) throw error
            break
          }
          case 'user': {
            const { error } = await supabaseAdmin
              .from('profiles')
              .update({ is_active, updated_at: new Date().toISOString() })
              .eq('id', id)
            if (error) throw error
            break
          }
          default:
            throw new Error('Unknown toggle_active type')
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('❌ [Admin Operations] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
import { supabase } from './supabase'

/**
 * Llama a operaciones administrativas via Edge Function
 * Reemplaza el uso directo de supabaseAdmin en frontend
 */

export interface IssueRequest {
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

export interface SaveCourseRequest {
  action: 'save_course'
  data: {
    course: any
    lessons: any[]
    evaluations: any[]
    editingCourse?: boolean
  }
}

export interface SaveTeacherRequest {
  action: 'save_teacher'
  data: {
    teacher: any
    editingTeacher?: boolean
  }
}

export interface SaveUserRequest {
  action: 'save_user'
  data: {
    userData: any
    editingUser?: any
  }
}

export interface DeleteRequest {
  action: 'delete_resource'
  data: {
    type: 'course' | 'user' | 'teacher' | 'certificate'
    id: string
    userId?: string
  }
}

export interface ToggleActiveRequest {
  action: 'toggle_active'
  data: {
    type: 'course' | 'user' | 'teacher'
    id: string
    is_active: boolean
  }
}

type AdminRequest = IssueRequest | SaveCourseRequest | SaveTeacherRequest | SaveUserRequest | DeleteRequest | ToggleActiveRequest

/**
 * Invoca operación administrativa via Edge Function
 */
export async function invokeAdminOperation(request: AdminRequest) {
  try {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: request
    })

    if (error) {
      throw new Error(error.message || 'Admin operation failed')
    }

    return data
  } catch (err) {
    console.error('❌ Admin operation error:', err)
    throw err
  }
}

/**
 * Emite un certificado via Edge Function
 */
export async function issueCertificate(params: IssueRequest['data']) {
  return invokeAdminOperation({
    action: 'issue_certificate',
    data: params
  })
}

/**
 * Guarda un curso via Edge Function
 */
export async function saveCourseViaAdmin(params: SaveCourseRequest['data']) {
  return invokeAdminOperation({
    action: 'save_course',
    data: params
  })
}

/**
 * Guarda un profesor via Edge Function
 */
export async function saveTeacherViaAdmin(params: SaveTeacherRequest['data']) {
  return invokeAdminOperation({
    action: 'save_teacher',
    data: params
  })
}

/**
 * Guarda un usuario via Edge Function
 */
export async function saveUserViaAdmin(params: SaveUserRequest['data']) {
  return invokeAdminOperation({
    action: 'save_user',
    data: params
  })
}

/**
 * Elimina un recurso via Edge Function
 */
export async function deleteResourceViaAdmin(params: DeleteRequest['data']) {
  return invokeAdminOperation({
    action: 'delete_resource',
    data: params
  })
}

/**
 * Activa o desactiva un recurso via Edge Function
 */
export async function toggleActiveViaAdmin(params: ToggleActiveRequest['data']) {
  return invokeAdminOperation({
    action: 'toggle_active',
    data: params
  })
}
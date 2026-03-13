import { supabase } from './supabase'

const PRIMARY_ADMIN_FUNCTION = 'admin-operations'
const LEGACY_ADMIN_FUNCTION = 'bright-action'

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

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err

  if (err && typeof err === 'object' && 'message' in err) {
    const maybeMessage = (err as { message?: unknown }).message
    if (typeof maybeMessage === 'string') return maybeMessage
  }

  return 'Admin operation failed'
}

function isRecoverableFunctionError(err: unknown): boolean {
  const rawMessage = extractErrorMessage(err).toLowerCase()

  if (
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('cors') ||
    rawMessage.includes('not found') ||
    rawMessage.includes('404') ||
    rawMessage.includes('does not exist') ||
    rawMessage.includes('network')
  ) {
    return true
  }

  const status = err && typeof err === 'object' && 'status' in err
    ? Number((err as { status?: number }).status)
    : undefined

  return status === 404
}

async function invokeFunction(functionName: string, request: AdminRequest) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: request,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Invoca operación administrativa via Edge Function
 */
export async function invokeAdminOperation(request: AdminRequest) {
  try {
    return await invokeFunction(PRIMARY_ADMIN_FUNCTION, request)
  } catch (primaryErr) {
    const shouldTryLegacy = request.action === 'toggle_active' && isRecoverableFunctionError(primaryErr)

    if (shouldTryLegacy) {
      console.warn('⚠️ Primary admin function unavailable, trying legacy endpoint...')

      try {
        return await invokeFunction(LEGACY_ADMIN_FUNCTION, request)
      } catch (legacyErr) {
        console.error('❌ Admin operation error (primary + legacy):', {
          primary: extractErrorMessage(primaryErr),
          legacy: extractErrorMessage(legacyErr),
        })
        throw new Error(extractErrorMessage(legacyErr))
      }
    }

    console.error('❌ Admin operation error:', primaryErr)
    throw new Error(extractErrorMessage(primaryErr))
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
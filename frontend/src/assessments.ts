import { supabase } from './supabase'

export type AssessmentType = 'personal' | 'business'

export type SavedAssessment = {
  id: string
  user_id: string
  title: string
  assessment_type: AssessmentType
  input_data: Record<string, unknown>
  result_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

type SaveAssessmentParams = {
  title: string
  assessmentType: AssessmentType
  inputData: Record<string, unknown>
  resultData: Record<string, unknown>
}

export async function saveAssessment({
  title,
  assessmentType,
  inputData,
  resultData,
}: SaveAssessmentParams) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be signed in to save an assessment.')
  }

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: user.id,
      title: title.trim(),
      assessment_type: assessmentType,
      input_data: inputData,
      result_data: resultData,
    })
    .select()
    .single()

  if (error) {
    console.error('Assessment save failed:', error.message)
    throw new Error('We could not save this assessment. Please try again.')
  }

  return data as SavedAssessment
}

export async function getAssessments() {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Assessment history failed to load:', error.message)
    throw new Error('We could not load your assessment history.')
  }

  return (data ?? []) as SavedAssessment[]
}

export async function deleteAssessment(id: string) {
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Assessment deletion failed:', error.message)
    throw new Error('We could not delete this assessment.')
  }
}
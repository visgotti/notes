'use server'
import Notes from '@/components/notes';
import { notes } from '@/pages/api/notes';

export default async function NotesPage() {
  return <Notes notes={notes}/>
}
/** cloneme: P-04 — Lettre de motivation : page d'attente (Phase 2). */
import { FileText } from 'lucide-react'
import PageAttente from '../components/ui/PageAttente'

export default function MotivationLetter() {
  return (
    <PageAttente
      icone={FileText}
      phase="Phase 2"
      titre="Adaptation de lettre de motivation"
      description="Upload PDF/DOCX + offre d'emploi → lettre adaptée par IA."
      prevu={['Import de ta lettre en PDF ou DOCX', "Collage de l'offre d'emploi", 'Lettre adaptée par IA, puis export PDF ou DOCX']}
    />
  )
}

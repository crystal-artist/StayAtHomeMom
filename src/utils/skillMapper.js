export const SKILL_RULES = [
  {
    keywords: ['meltdown', 'calm', 'breath', 'emotional', 'tantrum', 'upset', 'anxiety', 'cry', 'quiet', 'duration'],
    category: 'Emotional Management',
    skills: ['Crisis De-escalation', 'Emotional Intelligence', 'Stress Regulation'],
    resumeTip: 'You navigated high-stress emotional situations this week — that\'s crisis management and emotional intelligence, core competencies in HR, counseling, education, and team leadership roles.',
  },
  {
    keywords: ['vaccine', 'doctor', 'medicine', 'vitamin', 'appointment', 'hospital', 'clinic', 'health', 'administered'],
    category: 'Health & Medical',
    skills: ['Healthcare Coordination', 'Medical Scheduling', 'Preventive Care Planning'],
    resumeTip: 'Coordinating medical appointments and health routines demonstrates healthcare navigation and scheduling skills valued in medical administration, patient coordination, and health services roles.',
  },
  {
    keywords: ['school', 'teacher', 'homework', 'reading', 'learning', 'education', 'sports day', 'class', 'newsletter', 'corner'],
    category: 'Education & Development',
    skills: ['Educational Support', 'Child Development', 'Community Liaison'],
    resumeTip: 'Your involvement in educational and school activities reflects communication skills, child development knowledge, and community engagement — transferable to teaching assistance, social work, and nonprofit roles.',
  },
  {
    keywords: ['grocery', 'eggs', 'milk', 'cook', 'meal', 'lunch', 'dinner', 'food', 'buy', 'shop', 'texture', 'vegetables', 'bites'],
    category: 'Home Operations',
    skills: ['Nutrition Planning', 'Budget Management', 'Procurement'],
    resumeTip: 'Planning and managing household nutrition on a budget is directly equivalent to procurement and resource management in operations, supply chain, and hospitality roles.',
  },
  {
    keywords: ['plumber', 'repair', 'maintenance', 'fix', 'broken', 'contractor', 'pipe', 'install'],
    category: 'Project Coordination',
    skills: ['Vendor Management', 'Project Coordination', 'Facilities Management'],
    resumeTip: 'Coordinating repairs and contractors is real-world vendor management and project coordination — directly applicable to operations, office management, and facilities administration roles.',
  },
  {
    keywords: ['government', 'document', 'office', 'paperwork', 'form', 'admin', 'certificate', 'permit'],
    category: 'Administrative',
    skills: ['Administrative Management', 'Regulatory Navigation', 'Documentation'],
    resumeTip: 'Managing government paperwork and official processes demonstrates administrative competency, attention to detail, and regulatory knowledge — directly applicable to office and executive administration roles.',
  },
  {
    keywords: ['schedule', 'plan', 'organiz', 'routine', 'morning', 'bedtime', 'transition', 'friction'],
    category: 'Planning & Scheduling',
    skills: ['Schedule Management', 'Routine Design', 'Operations Planning'],
    resumeTip: 'Designing and maintaining daily routines for a household demonstrates operational planning and schedule management skills — directly applicable to project management, coordination, and executive assistant roles.',
  },
  {
    keywords: ['outdoor', 'play', 'activity', 'exercise', 'park', 'laughter', 'explore'],
    category: 'Child Development',
    skills: ['Developmental Facilitation', 'Enrichment Programming', 'Physical Activity Planning'],
    resumeTip: 'Planning enriching outdoor and play activities reflects child development knowledge and program facilitation skills relevant to early childhood education, recreational programming, and community services roles.',
  },
]

export function extractSkills(texts) {
  const combined = texts.join(' ').toLowerCase()
  const matched = []
  const categories = {}

  for (const rule of SKILL_RULES) {
    const hits = rule.keywords.filter(kw => combined.includes(kw))
    if (hits.length > 0) {
      matched.push({ ...rule, hitCount: hits.length })
      categories[rule.category] = (categories[rule.category] || 0) + hits.length
    }
  }

  return { matched, categories }
}

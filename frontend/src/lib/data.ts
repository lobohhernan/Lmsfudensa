// Mock data for the FUDENSA LMS prototype

// Types
export interface Instructor {
  id: string;
  name: string;
  title: string;
  biography: string;
  avatar?: string;
  rating: number;
  students: number;
  courses: number;
  credentials: {
    title: string;
    institution: string;
    year: string;
  }[];
  experience: string[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "quiz" | "document";
  completed?: boolean;
  locked?: boolean;
  description?: string;
  youtubeId?: string;  // ID del video de YouTube (ej: "dQw4w9WgXcQ")
}

export interface EvaluationQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface FullCourse {
  id: string;
  title: string;
  slug: string;
  image: string;
  duration: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  certified: boolean;
  students: number;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  price?: number;
  instructor?: string; // Deprecated: usar instructorId
  instructorId?: string; // ID del instructor asignado
  lessons?: CourseLesson[];
  evaluation?: EvaluationQuestion[];
  fullDescription?: string;
  requirements?: string[];
  learningOutcomes?: string[];
}

// Instructors removed - migrated to Teachers table in Supabase

// Initialize courses from localStorage or use defaults
const getStoredCourses = (): FullCourse[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("fudensa_courses");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored courses:", e);
      }
    }
  }
  return defaultCourses;
};

export const saveCourses = (courses: FullCourse[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("fudensa_courses", JSON.stringify(courses));
  }
};

// Instructors data removed - migrated to Teachers table in Supabase

const defaultCourses: FullCourse[] = [
  {
    id: "1",
    title: "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar",
    slug: "rcp-adultos-aha-2020",
    image: "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=1200",
    duration: "8 horas",
    level: "Básico",
    certified: true,
    students: 12450,
    category: "RCP",
    rating: 4.9,
    reviews: 2450,
    price: 29900,
    instructorId: "1",
    description: "Aprende las técnicas de RCP para adultos según las guías AHA 2020",
    fullDescription: "Curso completo de Reanimación Cardiopulmonar para adultos basado en las últimas guías de la American Heart Association 2020. Aprenderás técnicas esenciales para salvar vidas en situaciones de emergencia cardíaca.",
    requirements: [
      "No se requiere experiencia previa",
      "Conexión a internet estable",
      "Dispositivo para ver videos"
    ],
    learningOutcomes: [
      "Dominar las técnicas de RCP para adultos",
      "Reconocer signos de paro cardíaco",
      "Utilizar un DEA correctamente",
      "Aplicar compresiones torácicas efectivas"
    ],
    lessons: [
      { id: "1", title: "Introducción a RCP", duration: "15 min", type: "video", completed: true, locked: false, youtubeId: "dQw4w9WgXcQ" },
      { id: "2", title: "Anatomía del sistema cardiovascular", duration: "20 min", type: "video", completed: true, locked: false, youtubeId: "dQw4w9WgXcQ" },
      { id: "3", title: "Reconocimiento de paro cardíaco", duration: "18 min", type: "video", completed: false, locked: false, youtubeId: "dQw4w9WgXcQ" },
      { id: "4", title: "Compresiones torácicas efectivas", duration: "25 min", type: "video", completed: false, locked: false, youtubeId: "dQw4w9WgXcQ" },
      { id: "5", title: "Ventilaciones de rescate", duration: "22 min", type: "video", completed: false, locked: false, youtubeId: "dQw4w9WgXcQ" },
    ],
    evaluation: [
      {
        id: 1,
        question: "¿Cuál es la profundidad correcta de las compresiones torácicas en un adulto durante la RCP?",
        options: ["Al menos 3 cm", "Al menos 5 cm", "Al menos 7 cm", "Al menos 10 cm"],
        correctAnswer: 1,
        explanation: "Las compresiones torácicas en adultos deben tener una profundidad de al menos 5 cm según las guías AHA 2020.",
      },
      {
        id: 2,
        question: "¿Cuál es la frecuencia recomendada de compresiones torácicas por minuto?",
        options: ["60-80 compresiones", "80-100 compresiones", "100-120 compresiones", "120-140 compresiones"],
        correctAnswer: 2,
        explanation: "La frecuencia óptima es de 100-120 compresiones por minuto.",
      },
    ],
  },
  {
    id: "2",
    title: "RCP Neonatal - Soporte Vital Pediátrico Avanzado",
    slug: "rcp-neonatal",
    image: "https://images.unsplash.com/photo-1725870475677-7dc91efe9f93?w=1200",
    duration: "12 horas",
    level: "Avanzado",
    certified: true,
    students: 8320,
    category: "RCP",
    rating: 4.8,
    reviews: 1820,
    price: 44900,
    instructorId: "2",
    description: "Técnicas avanzadas de soporte vital para pacientes pediátricos y neonatales",
  },
  {
    id: "3",
    title: "Primeros Auxilios Básicos - Manejo de Emergencias",
    slug: "primeros-auxilios-basicos",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?w=1200",
    duration: "6 horas",
    level: "Básico",
    certified: true,
    students: 15680,
    category: "Primeros Auxilios",
    rating: 4.7,
    reviews: 3240,
    price: 24900,
    instructor: "Dr. José Ramírez",
    description: "Fundamentos esenciales de primeros auxilios para situaciones de emergencia",
  },
  {
    id: "4",
    title: "Emergencias Médicas - Atención Prehospitalaria",
    slug: "emergencias-medicas",
    image: "https://images.unsplash.com/photo-1644488483724-4daed4a30390?w=1200",
    duration: "10 horas",
    level: "Intermedio",
    certified: true,
    students: 9540,
    category: "Emergencias",
    rating: 4.9,
    reviews: 1950,
    price: 34900,
    instructor: "Dr. Miguel Torres",
    description: "Manejo profesional de emergencias en el ámbito prehospitalario",
  },
  {
    id: "5",
    title: "Certificación en Soporte Vital Cardiovascular",
    slug: "soporte-vital-cardiovascular",
    image: "https://images.unsplash.com/photo-1722235623200-59966a71af50?w=1200",
    duration: "15 horas",
    level: "Avanzado",
    certified: true,
    students: 6720,
    category: "RCP",
    rating: 5.0,
    reviews: 1450,
    price: 49900,
    instructor: "Dr. Roberto Sánchez",
    description: "Certificación avanzada en soporte vital cardiovascular",
  },
  {
    id: "6",
    title: "Atención de Heridas y Quemaduras - Técnicas Avanzadas",
    slug: "heridas-quemaduras",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?w=1200",
    duration: "8 horas",
    level: "Intermedio",
    certified: true,
    students: 11230,
    category: "Primeros Auxilios",
    rating: 4.8,
    reviews: 2100,
    price: 29900,
    instructor: "Dra. Laura González",
    description: "Técnicas avanzadas para el tratamiento de heridas y quemaduras",
  },
];

// Instructors removed - migrated to Teachers table in Supabase
export let courses = getStoredCourses();

export type Course = FullCourse;

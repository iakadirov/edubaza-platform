const subjects = [
  {
    "nameUz": "Ona tili",
    "code": "NATIVE_LANGUAGE",
    "icon": "📚",
    "color": "#4ECDC4",
    "category": "Filologiya fanlari",
    "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    "nameUz": "O'qish savodxonligi",
    "code": "READING_LITERACY",
    "icon": "📖",
    "color": "#FF6B6B",
    "category": "Filologiya fanlari",
    "grades": [1, 2, 3, 4]
  },
  {
    "nameUz": "Adabiyot",
    "code": "LITERATURE",
    "icon": "🖋️",
    "color": "#95A5A6",
    "category": "Filologiya fanlari",
    "grades": [5, 6, 7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Rus tili",
    "code": "RUSSIAN_LANGUAGE",
    "icon": "🇷🇺",
    "color": "#1A535C",
    "category": "Filologiya fanlari",
    "grades": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Chet tili",
    "code": "FOREIGN_LANGUAGE",
    "icon": "🌍",
    "color": "#FFE66D",
    "category": "Filologiya fanlari",
    "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Tarixdan hikoyalar",
    "code": "HISTORY_STORIES",
    "icon": "📜",
    "color": "#D35400",
    "category": "Ijtimoiy fanlar",
    "grades": [5]
  },
  {
    "nameUz": "Qadimgi dunyo tarixi",
    "code": "ANCIENT_HISTORY",
    "icon": "🏛️",
    "color": "#E67E22",
    "category": "Ijtimoiy fanlar",
    "grades": [6]
  },
  {
    "nameUz": "O'zbekiston tarixi",
    "code": "HISTORY_UZB",
    "icon": "🇺🇿",
    "color": "#27AE60",
    "category": "Ijtimoiy fanlar",
    "grades": [7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Jahon tarixi",
    "code": "WORLD_HISTORY",
    "icon": "🌐",
    "color": "#2980B9",
    "category": "Ijtimoiy fanlar",
    "grades": [7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Davlat va huquq asoslari",
    "code": "LAW_BASICS",
    "icon": "⚖️",
    "color": "#34495E",
    "category": "Ijtimoiy fanlar",
    "grades": [8, 9, 10, 11]
  },
  {
    "nameUz": "Tarbiya",
    "code": "UPBRINGING",
    "icon": "🤝",
    "color": "#F1C40F",
    "category": "Ijtimoiy fanlar",
    "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Matematika",
    "code": "MATHEMATICS",
    "icon": "📐",
    "color": "#FF6B6B",
    "category": "Aniq fanlar",
    "grades": [1, 2, 3, 4, 5, 6, 7]
  },
  {
    "nameUz": "Algebra",
    "code": "ALGEBRA",
    "icon": "✖️",
    "color": "#C0392B",
    "category": "Aniq fanlar",
    "grades": [8, 9, 10, 11]
  },
  {
    "nameUz": "Geometriya",
    "code": "GEOMETRY",
    "icon": "🔺",
    "color": "#8E44AD",
    "category": "Aniq fanlar",
    "grades": [8, 9, 10, 11]
  },
  {
    "nameUz": "Informatika va axborot texnologiyalari",
    "code": "IT_CS",
    "icon": "💻",
    "color": "#3498DB",
    "category": "Aniq fanlar",
    "grades": [1, 2, 3, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Fizika",
    "code": "PHYSICS",
    "icon": "⚡",
    "color": "#F39C12",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Astronomiya",
    "code": "ASTRONOMY",
    "icon": "🔭",
    "color": "#2C3E50",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [11]
  },
  {
    "nameUz": "Kimyo",
    "code": "CHEMISTRY",
    "icon": "🧪",
    "color": "#16A085",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Biologiya",
    "code": "BIOLOGY",
    "icon": "🧬",
    "color": "#2ECC71",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [7, 8, 9, 10, 11]
  },
  {
    "nameUz": "Geografiya",
    "code": "GEOGRAPHY",
    "icon": "🗺️",
    "color": "#27AE60",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [7, 8, 9, 10]
  },
  {
    "nameUz": "Iqtisodiy bilim asoslari",
    "code": "ECONOMICS",
    "icon": "💰",
    "color": "#F1C40F",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [8, 9]
  },
  {
    "nameUz": "Tadbirkorlik asoslari",
    "code": "ENTREPRENEURSHIP",
    "icon": "💼",
    "color": "#34495E",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [11]
  },
  {
    "nameUz": "Tabiiy fanlar (Science)",
    "code": "SCIENCE",
    "icon": "🌿",
    "color": "#A2D9CE",
    "category": "Tabiiy va iqtisodiy fanlar",
    "grades": [1, 2, 3, 4, 5, 6]
  },
  {
    "nameUz": "Musiqa madaniyati",
    "code": "MUSIC",
    "icon": "🎵",
    "color": "#E91E63",
    "category": "Amaliy fanlar",
    "grades": [1, 2, 3, 4, 5, 6, 7]
  },
  {
    "nameUz": "Tasviriy san'at",
    "code": "FINE_ARTS",
    "icon": "🎨",
    "color": "#9B59B6",
    "category": "Amaliy fanlar",
    "grades": [1, 2, 3, 4, 5, 6, 7]
  },
  {
    "nameUz": "Chizmachilik",
    "code": "DRAWING",
    "icon": "📏",
    "color": "#7F8C8D",
    "category": "Amaliy fanlar",
    "grades": [8, 9]
  },
  {
    "nameUz": "Texnologiya",
    "code": "TECHNOLOGY",
    "icon": "🛠️",
    "color": "#E67E22",
    "category": "Amaliy fanlar",
    "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  {
    "nameUz": "Jismoniy tarbiya",
    "code": "PHYSICAL_EDUCATION",
    "icon": "⚽",
    "color": "#3498DB",
    "category": "Amaliy fanlar",
    "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  }
];

// Category mapping
const categoryMap = {
  "Filologiya fanlari": "60fb23d6-e235-4a86-9fab-57b36c5a3acd",
  "Ijtimoiy fanlar": "d1464446-54f0-4718-b807-eb4544b2e5f4",
  "Aniq fanlar": "6d3cb1e9-908f-4572-8a26-b0b021f0810d",
  "Tabiiy va iqtisodiy fanlar": "82f84bb7-e3b6-41cb-a65b-78b71788eee2",
  "Amaliy fanlar": "f000d222-ae15-4995-b469-4d9fd6a99498"
};

// Get token from localStorage via browser
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.error('Usage: node import-subjects.js <JWT_TOKEN>');
  console.error('\nTo get your token:');
  console.error('1. Open browser console on http://localhost:3003');
  console.error('2. Run: localStorage.getItem("token")');
  console.error('3. Copy the token and run: node import-subjects.js YOUR_TOKEN');
  process.exit(1);
}

async function importSubjects() {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const categoryId = categoryMap[subject.category];

    if (!categoryId) {
      console.error(`❌ Unknown category: ${subject.category}`);
      failed++;
      continue;
    }

    const body = {
      code: subject.code,
      nameUz: subject.nameUz,
      descriptionUz: '',
      icon: subject.icon,
      color: subject.color,
      sortOrder: i + 1,
      grades: subject.grades,
      categoryIds: [categoryId]
    };

    try {
      const response = await fetch('http://localhost:3003/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${i + 1}/${subjects.length} - ${subject.nameUz}`);
        success++;
      } else {
        console.error(`❌ ${subject.nameUz}: ${data.message}`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${subject.nameUz}: ${error.message}`);
      failed++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n=== IMPORT COMPLETE ===');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${subjects.length}`);
}

importSubjects().catch(console.error);

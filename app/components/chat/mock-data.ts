import type {
  Conversation,
  Message,
  Participant,
  QuickFile,
} from './types'

export const defaultActiveConversationId = 6

export const initialConversations: Conversation[] = [
  {
    id: 1,
    name: 'U15-3',
    initials: 'JK',
    preview: 'الأهالي الكرام، أسعد الله صباحكم بكل خير...',
    timestamp: 'Tue, Nov 25 · 2:22 PM',
    seen: 'Seen by 52',
    tag: 'Teams',
  },
  {
    id: 2,
    name: 'U13-3',
    initials: 'JJ',
    preview: 'تم مشاركة صور التدريب الأخير، يرجى الاطلاع على اللقطات.',
    timestamp: 'Tue, Nov 25 · 2:22 PM',
    seen: 'Seen by 34',
    tag: 'Teams',
  },
  {
    id: 3,
    name: 'U10-2',
    initials: 'U2',
    preview: 'يرجى تأكيد الحضور لمباراة نهاية الأسبوع.',
    timestamp: 'Tue, Nov 25 · 2:21 PM',
    seen: 'Seen by 18',
    tag: 'Scheduling',
  },
  {
    id: 4,
    name: 'U10-1',
    initials: 'U1',
    preview: 'بشار: https://ts-upload...',
    timestamp: 'Fri, Nov 14 · 9:55 AM',
    seen: 'Seen by 21',
    tag: 'Media',
    unread: 4,
  },
  {
    id: 5,
    name: 'U13-1',
    initials: 'U1',
    preview: 'تحميل صور مباريات كأس الأردن متاحة الآن.',
    timestamp: 'Sat, Nov 8 · 1:29 PM',
    seen: 'Seen by 40',
    tag: 'Media',
  },
  {
    id: 6,
    name: 'Coaches',
    initials: 'CH',
    preview: 'Bashar: https://ts-uploads/...',
    timestamp: 'Sat, Nov 8 · 1:29 PM',
    seen: '+3 more',
    tag: 'Staff',
  },
]

export const initialMessagesByConversation: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: 'Coach Ahmad',
      initials: 'CA',
      role: 'Head Coach',
      time: 'Tue, Nov 25 · 2:20 PM',
      content: 'الأهالي الكرام، أسعد الله صباحكم بكل خير...',
    },
    {
      id: 2,
      sender: 'Parent Ali',
      initials: 'PA',
      role: 'Parent',
      time: 'Tue, Nov 25 · 2:21 PM',
      content: 'شكراً على التحديث، متى التدريب القادم؟',
    },
    {
      id: 3,
      sender: 'Coach Ahmad',
      initials: 'CA',
      role: 'Head Coach',
      time: 'Tue, Nov 25 · 2:22 PM',
      content: 'التدريب القادم يوم السبت الساعة 4 مساءً.',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'Coach Hassan',
      initials: 'CH',
      role: 'Assistant Coach',
      time: 'Tue, Nov 25 · 2:15 PM',
      content: 'تم مشاركة صور التدريب الأخير، يرجى الاطلاع على اللقطات.',
    },
    {
      id: 2,
      sender: 'Parent Sara',
      initials: 'PS',
      role: 'Parent',
      time: 'Tue, Nov 25 · 2:18 PM',
      content: 'رائع! أين يمكننا تحميل الصور؟',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'Admin',
      initials: 'AD',
      role: 'Administrator',
      time: 'Tue, Nov 25 · 2:10 PM',
      content: 'يرجى تأكيد الحضور لمباراة نهاية الأسبوع.',
    },
    {
      id: 2,
      sender: 'Parent Khalid',
      initials: 'PK',
      role: 'Parent',
      time: 'Tue, Nov 25 · 2:12 PM',
      content: 'تم تأكيد الحضور، شكراً.',
    },
  ],
  4: [
    {
      id: 1,
      sender: 'Bashar',
      initials: 'BA',
      role: 'Administrator',
      time: 'Fri, Nov 14 · 9:50 AM',
      content: 'مرحباً بالجميع، هل يمكنكم تحديث معلومات الاتصال؟',
    },
    {
      id: 2,
      sender: 'Parent Omar',
      initials: 'PO',
      role: 'Parent',
      time: 'Fri, Nov 14 · 9:52 AM',
      content: 'سأقوم بذلك الآن.',
    },
    {
      id: 3,
      sender: 'Bashar',
      initials: 'BA',
      role: 'Administrator',
      time: 'Fri, Nov 14 · 9:55 AM',
      content: 'شكراً لكم جميعاً!',
    },
  ],
  5: [
    {
      id: 1,
      sender: 'Media Team',
      initials: 'MT',
      role: 'Staff',
      time: 'Sat, Nov 8 · 1:25 PM',
      content: 'تحميل صور مباريات كأس الأردن متاحة الآن.',
    },
    {
      id: 2,
      sender: 'Parent Layla',
      initials: 'PL',
      role: 'Parent',
      time: 'Sat, Nov 8 · 1:27 PM',
      content: 'ممتاز! شكراً على المشاركة.',
    },
  ],
  6: [
    {
      id: 1,
      sender: 'Bashar',
      initials: 'BA',
      role: 'Administrator',
      time: 'Tue, Nov 25 · 2:21 PM',
      content:
        'الأهالي الكرام، أسعد الله صباحكم بكل خير. نود مشاركتكم لقطات مباريات كأس الأردن لهذا الأسبوع.',
      attachments: [
        {
          id: 1,
          type: 'video',
          src: '/login.mp4',
          duration: '0:07',
          poster: '/logo.jpeg',
          label: 'Game 1',
        },
        {
          id: 2,
          type: 'video',
          src: '/login.mp4',
          duration: '0:13',
          poster: '/logo.jpeg',
          label: 'Game 2',
        },
        {
          id: 3,
          type: 'video',
          src: '/login.mp4',
          duration: '0:15',
          poster: '/logo.jpeg',
          label: 'Game 3',
        },
        {
          id: 4,
          type: 'video',
          src: '/login.mp4',
          duration: '0:08',
          poster: '/logo.jpeg',
          label: 'Game 4',
        },
      ],
    },
    {
      id: 2,
      sender: 'Abed',
      initials: 'AA',
      role: 'Coach',
      time: 'Tue, Nov 25 · 2:23 PM',
      content:
        'شكراً بشار. سنشارك اللقطات مع الأهالي اليوم لتأكيد الحضور والحماس للمباريات القادمة.',
    },
    {
      id: 3,
      sender: 'Sarah',
      initials: 'SA',
      role: 'Assistant',
      time: 'Tue, Nov 25 · 2:24 PM',
      content:
        'تمت جدولة المنشور على صفحة النادي، وإذا احتجتم دعم إضافي مع المنتسبين أعلِموني.',
    },
  ],
}

export const chatParticipants: Participant[] = [
  {
    id: 1,
    name: 'Bashar Abdulalleh',
    initials: 'BA',
    role: 'Administrator',
    status: 'Online',
  },
  {
    id: 2,
    name: 'Abed Alkhatib',
    initials: 'AA',
    role: 'Coach',
    status: 'Online',
  },
  {
    id: 3,
    name: 'Sarah Alami',
    initials: 'SA',
    role: 'Assistant',
    status: 'Offline',
  },
  {
    id: 4,
    name: 'Fadi Arabiat',
    initials: 'FA',
    role: 'Coach',
    status: 'Offline',
  },
]

export const chatQuickFiles: QuickFile[] = [
  {
    id: 1,
    name: 'JordanCup-highlights.mp4',
    size: '128 MB',
    updatedAt: 'Updated 2h ago',
  },
  {
    id: 2,
    name: 'Weekend-schedule.pdf',
    size: '1.8 MB',
    updatedAt: 'Updated yesterday',
  },
  {
    id: 3,
    name: 'Training-plan.xlsx',
    size: '620 KB',
    updatedAt: 'Updated Mon',
  },
]


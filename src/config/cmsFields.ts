// Field configurations for different content types

export const packageFields = [
  // === IMAGES & GALLERY ===
  {
    name: 'image',
    label: 'Main Package Image',
    type: 'image' as const,
    placeholder: 'Upload main image (shown on landing page)'
  },
  {
    name: 'gallery',
    label: 'Gallery / Thumbnails',
    type: 'gallery' as const,
    placeholder: 'Upload 4 images for detail page gallery'
  },
  
  // === BASIC INFO ===
  {
    name: 'title',
    label: 'Package Title',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g., Bromo Sunrise Adventure'
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text' as const,
    placeholder: 'e.g., Bromo Tengger, East Java'
  },
  {
    name: 'mapEmbedUrl',
    label: 'Google Maps Embed URL',
    type: 'mapEmbed' as const,
    placeholder: 'Paste Google Maps embed URL (from Share > Embed a map)'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'Adventure', label: 'Adventure' },
      { value: 'Cultural', label: 'Cultural' },
      { value: 'Photography', label: 'Photography' },
      { value: 'Family', label: 'Family' },
      { value: 'Luxury', label: 'Luxury' }
    ]
  },
  {
    name: 'rating',
    label: 'Rating',
    type: 'number' as const,
    required: true,
    placeholder: '4.8'
  },
  {
    name: 'reviewCount',
    label: 'Review Count',
    type: 'number' as const,
    required: true,
    placeholder: '1250'
  },
  
  // === PRICING & DURATION ===
  {
    name: 'price',
    label: 'Price (IDR)',
    type: 'number' as const,
    required: true,
    placeholder: '1500000'
  },
  {
    name: 'duration',
    label: 'Duration',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g., 3 Days 2 Nights'
  },
  
  // === TOUR DETAILS ===
  {
    name: 'departure',
    label: 'Departure Date',
    type: 'date' as const,
    placeholder: 'Select departure date'
  },
  {
    name: 'return',
    label: 'Return Date',
    type: 'date' as const,
    placeholder: 'Select return date'
  },
  {
    name: 'totalPeople',
    label: 'Max Participants',
    type: 'number' as const,
    placeholder: '28'
  },
  {
    name: 'destinations',
    label: 'Destination',
    type: 'array' as const,
    placeholder: 'e.g., Mount Bromo'
  },
  
  // === DESCRIPTION ===
  {
    name: 'description',
    label: 'Short Description',
    type: 'rich-text' as const,
    required: true
  },
  {
    name: 'longDescription',
    label: 'Long Description',
    type: 'rich-text' as const,
    placeholder: 'Detailed description for package detail page...'
  },
  
  // === HIGHLIGHTS ===
  {
    name: 'highlights',
    label: 'Highlight',
    type: 'array' as const,
    placeholder: 'e.g., Sunrise view at Penanjakan'
  },
  
  // === ITINERARY ===
  {
    name: 'itinerary',
    label: 'Itinerary',
    type: 'itinerary' as const,
    placeholder: ''
  },
  
  // === INCLUDES & EXCLUDES ===
  {
    name: 'includes',
    label: 'Item',
    type: 'array' as const,
    placeholder: 'e.g., Transportation'
  },
  {
    name: 'excludes',
    label: 'Item',
    type: 'array' as const,
    placeholder: 'e.g., International flights'
  },
  
  // === FAQs ===
  {
    name: 'faqs',
    label: 'FAQs',
    type: 'faq' as const,
    placeholder: ''
  },
  
  // === PUBLICATION STATUS ===
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' }
    ]
  }
];

export const blogFields = [
  // === FEATURED IMAGE ===
  {
    name: 'image',
    label: 'Featured Image',
    type: 'image' as const,
    placeholder: 'Upload featured image (800x400px recommended)'
  },

  // === BASIC INFO ===
  {
    name: 'title',
    label: 'Blog Title',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g., Complete Guide to Bromo Sunrise'
  },
  {
    name: 'excerpt',
    label: 'Excerpt / Short Description',
    type: 'textarea' as const,
    required: true,
    rows: 3,
    placeholder: 'Brief description that appears in blog cards...'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'Travel Guide', label: 'Travel Guide' },
      { value: 'Adventure', label: 'Adventure' },
      { value: 'Photography', label: 'Photography' },
      { value: 'Tips', label: 'Tips' },
      { value: 'News', label: 'News' },
      { value: 'Culture', label: 'Culture' },
      { value: 'Destinations', label: 'Destinations' },
      { value: 'Budget Travel', label: 'Budget Travel' },
      { value: 'Solo Travel', label: 'Solo Travel' }
    ]
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'array' as const,
    placeholder: 'Add tag (e.g., Bromo, Sunrise, Photography)'
  },

  // === CONTENT ===
  {
    name: 'content',
    label: 'Full Article Content',
    type: 'rich-text' as const,
    required: true
  },

  // === AUTHOR & METADATA ===
  {
    name: 'author',
    label: 'Author Name',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g., Bromo Ijen Tour Team'
  },
  {
    name: 'publishDate',
    label: 'Publish Date',
    type: 'date' as const,
    required: true
  },
  {
    name: 'readTime',
    label: 'Read Time',
    type: 'text' as const,
    placeholder: 'e.g., 5 min read'
  },

  // === PUBLICATION STATUS ===
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' }
    ]
  },
  {
    name: 'featured',
    label: 'Featured Post',
    type: 'checkbox' as const
  }
];

export const testimonialFields = [
  {
    name: 'name',
    label: 'Customer Name',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g., Sarah Johnson'
  },
  {
    name: 'role',
    label: 'Role/Title',
    type: 'text' as const,
    placeholder: 'e.g., Travel Blogger'
  },
  {
    name: 'content',
    label: 'Testimonial Content',
    type: 'textarea' as const,
    required: true,
    rows: 4,
    placeholder: 'Write the customer testimonial here...'
  },
  {
    name: 'rating',
    label: 'Rating (1-5)',
    type: 'number' as const,
    required: true,
    placeholder: '5'
  },
  {
    name: 'image',
    label: 'Customer Photo URL',
    type: 'url' as const,
    placeholder: 'https://example.com/photo.jpg'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  }
];

export const galleryFields = [
  {
    name: 'title',
    label: 'Photo Title',
    type: 'text' as const,
    required: true,
    placeholder: 'e.g., Bromo Sunrise View'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'Landscape', label: 'Landscape' },
      { value: 'Portrait', label: 'Portrait' },
      { value: 'Adventure', label: 'Adventure' },
      { value: 'Culture', label: 'Culture' },
      { value: 'Wildlife', label: 'Wildlife' }
    ]
  },
  {
    name: 'image',
    label: 'Upload Image',
    type: 'image' as const,
    required: true,
    placeholder: 'Click to browse and upload image'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    rows: 3,
    placeholder: 'Describe the photo...'
  },
  {
    name: 'tags',
    label: 'Tags (comma separated)',
    type: 'text' as const,
    placeholder: 'bromo, sunrise, mountain, volcano'
  },
  {
    name: 'likes',
    label: 'Likes Count',
    type: 'number' as const,
    placeholder: '0'
  },
  {
    name: 'views',
    label: 'Views Count',
    type: 'number' as const,
    placeholder: '0'
  }
];

// Column configurations for list views
export const packageColumns = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', type: 'badge' as const },
  { key: 'price', label: 'Price', type: 'number' as const },
  { key: 'rating', label: 'Rating', type: 'number' as const },
  { key: 'status', label: 'Status', type: 'badge' as const },
  { key: 'available', label: 'Available', type: 'badge' as const }
];

export const blogColumns = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', type: 'badge' as const },
  { key: 'author', label: 'Author' },
  { key: 'status', label: 'Status', type: 'badge' as const },
  { key: 'publishDate', label: 'Publish Date', type: 'date' as const }
];

export const testimonialColumns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'rating', label: 'Rating', type: 'number' as const },
  { key: 'status', label: 'Status', type: 'badge' as const },
  { key: 'createdAt', label: 'Created', type: 'date' as const }
];

export const galleryColumns = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', type: 'badge' as const },
  { key: 'likes', label: 'Likes', type: 'number' as const },
  { key: 'views', label: 'Views', type: 'number' as const },
  { key: 'createdAt', label: 'Created', type: 'date' as const }
];

// Badge colors for different statuses
export const badgeColors = {
  // Status colors
  'pending': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'completed': 'bg-blue-100 text-blue-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'draft': 'bg-gray-100 text-gray-800',
  'published': 'bg-green-100 text-green-800',
  'archived': 'bg-gray-100 text-gray-800',
  
  // Payment status colors
  'paid': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'refunded': 'bg-orange-100 text-orange-800',
  
  // Category colors
  'Adventure': 'bg-orange-100 text-orange-800',
  'Cultural': 'bg-purple-100 text-purple-800',
  'Photography': 'bg-blue-100 text-blue-800',
  'Family': 'bg-green-100 text-green-800',
  'Luxury': 'bg-yellow-100 text-yellow-800',
  'Volcano': 'bg-red-100 text-red-800',
  'Mountain': 'bg-gray-100 text-gray-800',
  'Lake': 'bg-blue-100 text-blue-800',
  'Beach': 'bg-cyan-100 text-cyan-800',
  
  // Boolean colors
  'true': 'bg-green-100 text-green-800',
  'false': 'bg-gray-100 text-gray-800',
  'yes': 'bg-green-100 text-green-800',
  'no': 'bg-gray-100 text-gray-800'
};

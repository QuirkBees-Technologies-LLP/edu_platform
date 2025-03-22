// Generate more courses for demonstration

const mockNames = [
  "Sarah Johnson",
  "Mike Chen",
  "Alex Turner",
  "Emma Wilson",
  "David Brown",
];

const popularCourses = Array.from({ length: 90 }, (_, index) => ({
  id: index + 1,
  title: `Course ${index + 1}`,
  subtitle: `Description for course ${index + 1}`,
  instructor: {
    name: mockNames[index % 5],
    image:
      [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      ][index % 5] + "?auto=format&fit=crop&q=80&w=100",
  },
  duration: `${Math.floor(Math.random() * 10 + 2)} hours`,
  image:
    [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293",
    ][index % 5] + "?auto=format&fit=crop&q=80&w=800",
}));

export default popularCourses;

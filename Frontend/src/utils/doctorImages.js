import drJohnSmith from '../assets/images/Dr. John Smith.jpg.avif';
import drMichaelChen from '../assets/images/Dr. Michael Chen.jpeg';
import drEmilyRodriguez from '../assets/images/Dr. Emily Rodriguez.webp.png';
import defaultDoctor from '../assets/images/Doctor.jpg.webp';

export const doctorImages = {
  'dr-john-smith': drJohnSmith,
  'dr-michael-chen': drMichaelChen,
  'dr-emily-rodriguez': drEmilyRodriguez,
  'default': defaultDoctor
};

export const doctorImageOptions = [
  { id: 'dr-john-smith', label: 'Dr. John Smith', image: drJohnSmith },
  { id: 'dr-michael-chen', label: 'Dr. Michael Chen', image: drMichaelChen },
  { id: 'dr-emily-rodriguez', label: 'Dr. Emily Rodriguez', image: drEmilyRodriguez },
  { id: 'default', label: 'Default Doctor', image: defaultDoctor }
];

export const getDoctorImage = (imageId) => {
  return doctorImages[imageId] || doctorImages['default'];
};

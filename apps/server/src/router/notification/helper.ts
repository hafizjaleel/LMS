import { generateEmailTemplate } from "../../lib/email";

export function getCourseEnrollmentEmail(
  courseName: string,
  courseLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Course Enrollment Successful',
    message: `You've successfully enrolled in <strong>${courseName}</strong>! Start your learning journey today.`,
    highlightText: `Course: ${courseName}`,
    buttonText: 'Go to Course',
    buttonLink: courseLink,
    alertType: 'success',
    footerMessage: 'Happy learning! If you have any questions, feel free to reach out.',
  });

  return {
    subject: `Welcome to ${courseName}`,
    html,
    text,
  };
}

export function getAssignmentDueEmail(
  assignmentName: string,
  dueDate: Date,
  assignmentLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Assignment Due Soon',
    message: `This is a reminder that <strong>${assignmentName}</strong> is approaching its deadline.`,
    highlightText: `Due: ${dueDate.toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })}`,
    alertMessage: 'Make sure to submit your work before the deadline to avoid late penalties.',
    buttonText: 'View Assignment',
    buttonLink: assignmentLink,
    alertType: 'warning',
  });

  return {
    subject: `Assignment Due: ${assignmentName}`,
    html,
    text,
  };
}

export function getAssignmentGradedEmail(
  assignmentName: string,
  grade: string,
  feedback: string | null,
  assignmentLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Assignment Graded',
    message: `Your submission for <strong>${assignmentName}</strong> has been graded.`,
    highlightText: `Grade: ${grade}`,
    highlightSubtext: feedback || undefined,
    buttonText: 'View Details',
    buttonLink: assignmentLink,
    alertType: 'success',
    footerMessage: 'Keep up the great work!',
  });

  return {
    subject: `Assignment Graded: ${assignmentName}`,
    html,
    text,
  };
}

export function getAnnouncementEmail(
  title: string,
  content: string,
  announcementLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'New Announcement',
    message: content,
    highlightText: title,
    buttonText: 'View Full Announcement',
    buttonLink: announcementLink,
    alertType: 'info',
  });

  return {
    subject: `New Announcement: ${title}`,
    html,
    text,
  };
}

export function getCourseUpdateEmail(
  courseName: string,
  updateMessage: string,
  courseLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Course Update',
    message: updateMessage,
    highlightText: `Course: ${courseName}`,
    buttonText: 'View Course',
    buttonLink: courseLink,
    alertType: 'info',
  });

  return {
    subject: `Update: ${courseName}`,
    html,
    text,
  };
}

export function getCertificateIssuedEmail(
  courseName: string,
  certificateLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Certificate Issued',
    message: `Congratulations! You've successfully completed <strong>${courseName}</strong> and earned your certificate.`,
    highlightText: 'Certificate of Completion',
    highlightSubtext: courseName,
    buttonText: 'Download Certificate',
    buttonLink: certificateLink,
    alertType: 'success',
    footerMessage: 'Share your achievement with your network!',
  });

  return {
    subject: `Certificate Issued: ${courseName}`,
    html,
    text,
  };
}

export function getLiveSessionStartingEmail(
  sessionName: string,
  startTime: Date,
  sessionLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Live Session Starting Soon',
    message: `<strong>${sessionName}</strong> is starting soon. Join now!`,
    highlightText: `Starting: ${startTime.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    })}`,
    alertMessage: 'The session will begin in a few minutes. Make sure you have a stable internet connection.',
    buttonText: 'Join Session',
    buttonLink: sessionLink,
    alertType: 'warning',
  });

  return {
    subject: `Live Session Starting: ${sessionName}`,
    html,
    text,
  };
}

export function getCourseCompletedEmail(
  courseName: string,
  courseLink: string,
  userName?: string
) {
  const { html, text } = generateEmailTemplate({
    userName,
    title: 'Course Completed',
    message: `Congratulations on completing <strong>${courseName}</strong>! You've made excellent progress in your learning journey.`,
    highlightText: 'Course Completed Successfully',
    highlightSubtext: courseName,
    buttonText: 'View Course',
    buttonLink: courseLink,
    alertType: 'success',
    footerMessage: 'Continue exploring more courses to expand your knowledge!',
  });

  return {
    subject: `Congratulations! You completed ${courseName}`,
    html,
    text,
  };
}

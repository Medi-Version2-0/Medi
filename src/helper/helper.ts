import { APIURL } from './api';

export const sendEmail = async ({
  email,
  subject,
  attachments,
  message,
}: {
  email: string;
  subject: string;
  message: string;
  attachments: { content: Blob; filename: string }[];
}) => {
  const formData = new FormData();
  formData.append('to', email);
  formData.append('subject', subject);
  formData.append('html', message);
  attachments.forEach((blob) => {
    formData.append(`attachments`, blob.content, blob.filename);
  });

  return fetch(APIURL + '/email', {
    method: 'POST',
    body: formData,
  }).then((res) => res.text());
};

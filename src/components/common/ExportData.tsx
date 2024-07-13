import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf, FaWhatsapp } from 'react-icons/fa6';
import { SiMicrosoftexcel } from 'react-icons/si';
import { BsFiletypeCsv, BsPrinter } from 'react-icons/bs';

interface ExportDataProps {
  data: any[];
  fields: { headerName: string; field: string }[];
}

const ExportData = ({ data, fields }: ExportDataProps) => {
  const [showModal, setShowModal] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [message, setMessage] = useState('');

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Exported Data', 20, 10);
    autoTable(doc, {
      head: [fields.map((field) => field.headerName)],
      body: data.map((item) => fields.map((field) => item[field.field])),
    });
    doc.save('exported_data.pdf');
  };

  const exportToBlob = () => {
    const doc = new jsPDF();
    doc.text('Exported Data', 20, 10);
    autoTable(doc, {
      head: [fields.map((field) => field.headerName)],
      body: data.map((item) => fields.map((field) => item[field.field])),
    });
    return doc.output('blob');
  };

  const showWhatsAppModal = () => setShowModal(true);
  const hideModal = () => setShowModal(false);

  const sendWhatsApp = async () => {
    const pdf = exportToBlob();
    const response = await sendWhatsAppMessage(
      phoneNumbers.split(','),
      message,
      pdf
    );

    if (response.success) {
      alert('Message sent!');
    } else {
      alert('Failed to send message');
    }
    hideModal();
  };

  const sendWhatsAppMessage = async (
    numbers: any,
    message: string,
    pdf: any
  ) => {
    const formData = new FormData();
    formData.append('numbers', numbers);
    formData.append('message', message);
    formData.append('pdf', pdf, 'exported_data.pdf');

    const response = await fetch('/send-whatsapp', {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ExportedData');
    XLSX.writeFile(workbook, `exported-data-${new Date().getDate()}.xlsx`);
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvs = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvs], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'exported_data.csv');
  };

  const printData = () => {
    const doc = new jsPDF();
    doc.text('Exported Data', 20, 10);
    autoTable(doc, {
      head: [fields.map((field) => field.headerName)],
      body: data.map((item) => fields.map((field) => item[field.field])),
    });

    const pdfOutput = doc.output('dataurlstring');
    const win = window.open('', '', 'width=800,height=600');
    win?.document.write(`
      <iframe width="100%" height="100%" src="${pdfOutput}"></iframe>
    `);
    win?.document.close();
  };

  return (
    <>
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10'>
          <div className='bg-white w-1/2 p-6 rounded-lg shadow-lg'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Send via WhatsApp</h2>
              <button
                className='text-gray-500 hover:text-gray-800'
                onClick={hideModal}
              >
                &times;
              </button>
            </div>
            <div className='mb-4'>
              <textarea
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Enter phone numbers separated by commas'
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                rows={4}
              />
            </div>
            <div className='mb-4'>
              <textarea
                className='w-full p-2 border border-gray-300 rounded-md'
                placeholder='Enter your message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className='flex justify-end'>
              <button
                className='bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-300'
                onClick={sendWhatsApp}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='flex flex-row border-2 border-rose-500 min-w-[30%] max-w-full w-[330px]'>
        <div className='flex flex-col gap-6'>
          <div className='bg-slate-300 max-w-min text-nowrap'>Export Data</div>
          <div className='flex flex-row gap-5 justify-self-end'>
            <button
              onClick={exportToPDF}
              className='items-center text-nowrap px-4 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-300'
            >
              <FaFilePdf size={25} />
            </button>
            <button
              onClick={exportToExcel}
              className='items-center text-nowrap px-4 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition duration-300'
            >
              <SiMicrosoftexcel size={25} />
            </button>
            <button
              onClick={exportToCSV}
              className='items-center text-nowrap px-4 py-3 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-700 transition duration-300'
            >
              <BsFiletypeCsv size={25} />
            </button>
            <button
              onClick={printData}
              className='items-center text-nowrap px-4 py-3 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition duration-300'
            >
              <BsPrinter size={25} />
            </button>
            <button
              onClick={showWhatsAppModal}
              className='items-center text-nowrap px-4 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition duration-300'
            >
              <FaWhatsapp size={25} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportData;

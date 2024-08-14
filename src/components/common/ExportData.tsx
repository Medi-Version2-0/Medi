import React, { useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf, FaChevronDown } from 'react-icons/fa';
import { SiMicrosoftexcel } from 'react-icons/si';
import { BsFiletypeCsv, BsPrinter } from 'react-icons/bs';
import { sendEmail } from '../../helper/helper';
import { MdOutlineAttachEmail } from 'react-icons/md';

interface ExportDataProps {
  data: any[];
  fields: { headerName: string; field: string }[];
}

export const printData = (data: any[], fields: { headerName: string; field: string }[]) => {
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

const ExportData = ({ data, fields }: ExportDataProps) => {
  const [emailOptionsVisible, setEmailOptionsVisible] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Exported Data', 20, 10);
    autoTable(doc, {
      head: [fields.map((field) => field.headerName)],
      body: data.map((item) => fields.map((field) => item[field.field])),
    });
    doc.save('exported_data.pdf');
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


  const pdfBlob = () => {
    const doc = new jsPDF();
    doc.text('Exported Price List ' + new Date().toLocaleString(), 20, 10);
    autoTable(doc, {
      head: [fields.map((field) => field.headerName)],
      body: data.map((item) => fields.map((field) => item[field.field])),
    });

    return doc.output('blob');
  };

  const excelBlob = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ExportedData');
    const arrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return blob;
  };

  const csvBlob = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvs = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvs], { type: 'text/csv;charset=utf-8;' });
    return blob;
  };

  const handleEmail = async () => {
    setIsLoading(true);

    const attachments = [];

    if (selectedFormats.includes('pdf')) {
      attachments.push({
        content: pdfBlob(),
        filename: `price_list_${new Date().toLocaleString()}.pdf`,
      });
    }
    if (selectedFormats.includes('excel')) {
      attachments.push({
        content: excelBlob(),
        filename: `price_list_${new Date().toLocaleString()}.xlsx`,
      });
    }
    if (selectedFormats.includes('csv')) {
      attachments.push({
        content: csvBlob(),
        filename: `price_list_${new Date().toLocaleString()}.csv`,
      });
    }

    await sendEmail({
      email,
      subject: 'Exported Price List ' + new Date().toLocaleString(),
      message: 'Please find the attached files with the exported data.',
      attachments,
    });
    setIsLoading(false);
    toggleEmailOptions();
  };

  const toggleEmailOptions = () => {
    setEmailOptionsVisible(!emailOptionsVisible);
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormats((prevFormats) =>
      prevFormats.includes(format)
        ? prevFormats.filter((f) => f !== format)
        : [...prevFormats, format]
    );
  };
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setEmailOptionsVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setEmailOptionsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className='flex flex-row  min-w-[30%] max-w-full w-[400px]'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-row gap-5'>
            <div className='relative'>
              <button
                onClick={toggleEmailOptions}
                className='flex items-center text-nowrap px-4 py-3 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition duration-300'
              >
                <MdOutlineAttachEmail size={25} />
                <FaChevronDown className='ml-2' />
              </button>
              {emailOptionsVisible && (
                <div
                  ref={popupRef}
                  className='absolute top-12  mt-1 flex flex-col items-center bg-white border rounded shadow-lg p-2 z-10 w-[250%]'
                >
                  <div className='flex flex-row'>
                    <div
                      onClick={() => handleFormatChange('pdf')}
                      className={`block cursor-pointer px-4 py-2 hover:bg-purple-100 ${
                        selectedFormats.includes('pdf')
                          ? 'bg-purple-500 text-white'
                          : ''
                      }`}
                    >
                      PDF
                    </div>
                    <div
                      onClick={() => handleFormatChange('excel')}
                      className={`block cursor-pointer px-4 py-2 hover:bg-purple-100 ${
                        selectedFormats.includes('excel')
                          ? 'bg-purple-500 text-white'
                          : ''
                      }`}
                    >
                      Excel
                    </div>
                    <div
                      onClick={() => handleFormatChange('csv')}
                      className={`block cursor-pointer px-4 py-2 hover:bg-purple-100 ${
                        selectedFormats.includes('csv')
                          ? 'bg-purple-500 text-white'
                          : ''
                      }`}
                    >
                      CSV
                    </div>
                  </div>
                  <div>
                    <input
                      type='email'
                      placeholder='Enter recipient email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='mt-2 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
                    />
                    <button
                      onClick={handleEmail}
                      className='mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className='w-10 h-6 flex flex-col'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 200 200'
                          >
                            <circle
                              fill='orange'
                              stroke='orange'
                              stroke-width='15'
                              r='15'
                              cx='40'
                              cy='100'
                            >
                              <animate
                                attributeName='opacity'
                                calcMode='spline'
                                dur='2'
                                values='1;0;1;'
                                keySplines='.5 0 .5 1;.5 0 .5 1'
                                repeatCount='indefinite'
                                begin='-.4'
                              ></animate>
                            </circle>
                            <circle
                              fill='#FF156D'
                              stroke='#FF156D'
                              stroke-width='15'
                              r='15'
                              cx='100'
                              cy='100'
                            >
                              <animate
                                attributeName='opacity'
                                calcMode='spline'
                                dur='2'
                                values='1;0;1;'
                                keySplines='.5 0 .5 1;.5 0 .5 1'
                                repeatCount='indefinite'
                                begin='-.2'
                              ></animate>
                            </circle>
                            <circle
                              fill='#FF156D'
                              stroke='#FF156D'
                              stroke-width='15'
                              r='15'
                              cx='160'
                              cy='100'
                            >
                              <animate
                                attributeName='opacity'
                                calcMode='spline'
                                dur='2'
                                values='1;0;1;'
                                keySplines='.5 0 .5 1;.5 0 .5 1'
                                repeatCount='indefinite'
                                begin='0'
                              ></animate>
                            </circle>
                          </svg>
                        </div>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
              onClick={() => printData(data, fields)}
              className='items-center text-nowrap px-4 py-3 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition duration-300'
            >
              <BsPrinter size={25} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportData;

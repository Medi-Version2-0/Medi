import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';

const CopyPratywisePriceList: React.FC = () => {
    const [copyFrom, setCopyFrom] = useState<string>('');
    const [copyTo, setCopyTo] = useState<any>();
    const { party: partyData } = useSelector((state: any) => state.global);
    const { organizationId } = useParams<{ organizationId: string }>();

    const handleCopy = async() => {
        await sendAPIRequest(`/${organizationId}/copyPartyWisePriceList`, {
            method: 'POST',
          });
        console.log(`Copying from ${copyFrom} to ${copyTo}`);
    };

    // Transform partyData into options array expected by react-select
    const options = partyData.map((party: any) => ({
        value: party.partyName,
        label: party.partyName
    }));

    return (
        <div className="flex items-center space-x-4 p-4">
            <div className="flex-1">
                <label htmlFor="copyFrom" className="block text-sm font-medium text-gray-700">
                    Copy From
                </label>
                <Select
                    id="copyFrom"
                    options={options}
                    value={{ value: copyFrom, label: copyFrom }}
                    onChange={(selectedOption: any) => setCopyFrom(selectedOption.value)}
                    className="mt-1 w-full"
                    placeholder="Select an option"
                />
            </div>

            {/* Dropdown for Copy To */}
            <div className="flex-1">
                <label htmlFor="copyTo" className="block text-sm font-medium text-gray-700">
                    Copy To
                </label>
                <Select
                    id="copyTo"
                    options={options}
                    value={{ value: copyTo, label: copyTo }}
                    onChange={(selectedOption: any) => setCopyTo(selectedOption.value)}
                    className="mt-1 w-full"
                    placeholder="Select an option"
                />
            </div>

            {/* Copy Button */}
            <button
                onClick={handleCopy}
                className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Copy
            </button>
        </div>
    );
};

export default CopyPratywisePriceList;

import { useFormik } from "formik";
import Button from "../../components/common/button/Button";
import CustomSelect from "../../components/custom_select/CustomSelect";
import { Popup } from "../../components/popup/Popup";
import FormikInputField from "../../components/common/FormikInputField";

const SearchItem = ({ handleClosePopup }: any) => {
    const formik = useFormik({
        initialValues: {
            searchStr: "",
            filterBy: ""
        },
        onSubmit: (values) => {
            console.log(values);
        },
    });

    return (
        <Popup heading={"Search Items"} childClass="min-w-[70rem] min-h-[60vh]" className="absolute">
            <div className="flex flex-col gap-2 justify-center items-center min-w-[500px]">
                <div className="flex gap-4 w-[80%]">
                    <CustomSelect
                        isPopupOpen={false}
                        label="Search By"
                        id="filterBy"
                        labelClass="min-w-[90px]"
                        value={formik.values.filterBy === ''
                            ? null
                            : {
                                label: formik.values.filterBy,
                                value: formik.values.filterBy,
                            }
                        }
                        onChange={(selectedOption: any) =>
                            formik.setFieldValue("filterBy", selectedOption.label)
                        }
                        options={[
                            { value: "batch", label: "Batch No." },
                            { value: "hsn", label: "HSN Code" },
                        ]}
                        isSearchable={true}
                        placeholder="Select"
                        disableArrow={true}
                        hidePlaceholder={false}
                        className="!h-8 rounded-sm w-full"
                        showErrorTooltip={true}
                    />
                    <FormikInputField
                        isPopupOpen={false}
                        label=''
                        id='searchStr'
                        name='searchStr'
                        onChange={formik.handleChange}
                        formik={formik}
                        placeholder={`Enter ${formik.values.filterBy || 'No.'}`}
                        className='h-8'
                    />

                    <Button type="fill">Search</Button>

                </div>

                <Button handleOnClick={handleClosePopup}>Close</Button>
            </div>
        </Popup>
    );
};

export default SearchItem;

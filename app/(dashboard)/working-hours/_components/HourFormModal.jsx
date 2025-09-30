'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const TIME = [
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM', '03:00 AM', '03:30 AM',
  '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

const validationSchema = Yup.object({
  day: Yup.number().required('Day is required'),
  is_closed: Yup.boolean(),
  from_hour: Yup.string().when('is_closed', {
    is: false,
    then: (schema) => schema.required('From Hour is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  to_hour: Yup.string().when(['is_closed', 'from_hour'], {
    is: (is_closed, from_hour) => !is_closed && from_hour,
    then: (schema) => schema
      .required('To Hour is required')
      .test(
        'is-after-from',
        'To Hour must be after From Hour',
        function (value) {
          const { from_hour, is_closed } = this.parent;
          if (is_closed || !from_hour || !value) return true;
          const fromIndex = TIME.indexOf(from_hour);
          const toIndex = TIME.indexOf(value);
          return toIndex > fromIndex;
        }
      ),
    otherwise: (schema) => schema.nullable(),
  }),
});

const OpeningHourFormModal = ({ open, onClose, initialValues, mode, onSubmitSuccess }) => {
  const axiosClient = createAxiosClient();
  const isEditMode = mode === 'edit';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const formik = useFormik({
    initialValues: initialValues || { day: '', from_hour: '', to_hour: '', is_closed: false },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      setFormError(null);
      try {
        const payload = {
          ...values,
          from_hour: values.is_closed ? null : values.from_hour,
          to_hour: values.is_closed ? null : values.to_hour,
        };
        if (isEditMode) {
          const response = await axiosClient.put(`/api/v1/vendor/opening-hours/${values.id}/`, payload);
          console.log('PUT Response:', response.data);
          toast.success('Opening hour updated successfully');
        } else {
          const response = await axiosClient.post('/api/v1/vendor/opening-hours/', payload);
          toast.success('Opening hour added successfully');
          resetForm();
        }
        onSubmitSuccess();
        onClose();
      } catch (error) {
        const errorMessage =
          error.response?.data?.day?.join(', ') ||
          error.response?.data?.non_field_errors?.join(', ') ||
          error.response?.data?.from_hour?.join(', ') ||
          error.response?.data?.to_hour?.join(', ') ||
          'Failed to save opening hour';
        setFormError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-gray bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-gray-800">
                {isEditMode ? 'Edit Opening Hour' : 'Add Opening Hour'}
              </h4>
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800" disabled={isSubmitting}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                  Day
                </label>
                <select
                  id="day"
                  name="day"
                  value={formik.values.day}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Select a day</option>
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                {formik.touched.day && formik.errors.day && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.day}</p>
                )}
              </div>

              {!formik.values.is_closed && (
                <>
                  <div>
                    <label htmlFor="from_hour" className="block text-sm font-medium text-gray-700">
                      From Hour
                    </label>
                    <select
                      id="from_hour"
                      name="from_hour"
                      value={formik.values.from_hour}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="">Select time</option>
                      {TIME.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {formik.touched.from_hour && formik.errors.from_hour && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.from_hour}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="to_hour" className="block text-sm font-medium text-gray-700">
                      To Hour
                    </label>
                    <select
                      id="to_hour"
                      name="to_hour"
                      value={formik.values.to_hour}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="">Select time</option>
                      {TIME.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {formik.touched.to_hour && formik.errors.to_hour && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.to_hour}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  id="is_closed"
                  name="is_closed"
                  type="checkbox"
                  checked={formik.values.is_closed}
                  onChange={formik.handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_closed" className="ml-2 block text-sm text-gray-700">
                  Closed
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OpeningHourFormModal;
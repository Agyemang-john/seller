'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OpeningHourFormModal from './HourFormModal';
import { createAxiosClient } from '@/utils/clientFetch';
import Swal from "sweetalert2";

const OpeningHoursList = () => {
  const axiosClient = createAxiosClient();
  const [openingHours, setOpeningHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedHour, setSelectedHour] = useState(null);

  const fetchOpeningHours = async () => {
    try {
      const response = await axiosClient.get('/api/v1/vendor/opening-hours/');
      setOpeningHours(response.data);
    } catch (error) {
      console.error('Error fetching opening hours:', error.response?.data || error.message);
      toast.error('Failed to fetch opening hours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpeningHours();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This opening hour will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/api/v1/vendor/opening-hours/${id}/`);
        setOpeningHours(openingHours.filter((hour) => hour.id !== id));
        toast.success("Opening hour deleted successfully");
      } catch (error) {
        toast.error("Failed to delete opening hour");
      }
    }
  };

  const handleEdit = (hour) => {
    setSelectedHour(hour);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedHour({ day: '', from_hour: '', to_hour: '', is_closed: false });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    fetchOpeningHours();
    setModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 w-full">
      <div className="flex justify-between items-center mb-6 p-4 rounded-lg shadow-sm">
        <h4 className="text-xl font-bold">Opening Hours</h4>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 rounded-lg transition"
          aria-label="Add new opening hour"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Opening Hour
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 h-12 rounded-lg" />
          ))}
        </div>
      ) : openingHours.length === 0 ? (
        <div className="text-center py-10">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600 text-lg">No opening hours set yet</p>
        </div>
      ) : (
        <div className="shadow-md rounded-lg overflow-hidden w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {openingHours.map((hour) => (
                  <motion.tr
                    key={hour.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    role="row"
                    aria-label={`Opening hour for ${hour.day_display}`}
                  >                    
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{hour.day_display}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{hour.is_closed ? '-' : hour.from_hour}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{hour.is_closed ? '-' : hour.to_hour}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hour.is_closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {hour.is_closed ? 'Closed' : 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(hour)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                        aria-label={`Edit opening hour for ${hour.day_display}`}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(hour.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Delete opening hour for ${hour.day_display}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <OpeningHourFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialValues={selectedHour}
        mode={modalMode}
        onSubmitSuccess={handleFormSubmitSuccess}
      />
    </div>
  );
};

export default OpeningHoursList;
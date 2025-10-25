import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import PageContainer from './PageContainer';
import {
  BanknotesIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserIcon,
  HashtagIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { createAxiosClient } from "@/utils/clientFetch";
import Swal from "sweetalert2";

const PaymentForm = () => {
  const pageTitle = "Payment Method";
  const axiosClient = createAxiosClient();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [bankSuggestions, setBankSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    paymentMethod: "momo",
    momoNumber: "",
    momoProvider: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    country: "GH",
    currency: "GHS",
  });

  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    fetchPaymentDetail();
  }, []);

  const fetchPaymentDetail = async () => {
    try {
      const response = await axiosClient.get("/api/v1/vendor/payment-method/");
      const data = response.data;
      if (data && Object.keys(data).length > 0) {
        setHasPaymentMethod(true);
        setFormData({
          paymentMethod: data.payment_method || "momo",
          momoNumber: data.momo_number || "",
          momoProvider: data.momo_provider || "",
          bankName: data.bank_name || "",
          bankAccountName: data.bank_account_name || "",
          bankAccountNumber: data.bank_account_number || "",
          country: data.country || "GH",
          currency: data.currency || "GHS",
        });
        setPaymentStatus(data.status || 'pending');
      } else {
        setHasPaymentMethod(false);
      }
    } catch (error) {
      setHasPaymentMethod(false);
      setPaymentStatus('pending');
    } finally {
      setLoading(false);
    }
  };


  const validateBankName = async (bankName) => {
    if (!bankName || formData.paymentMethod !== 'bank') {
      setBankSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await axiosClient.post("/api/v1/vendor/validate-bank/", { bank_name: bankName });
      if (response.data.match) {
        setBankSuggestions([response.data.match]);
        setShowSuggestions(true);
      } else {
        setBankSuggestions([]);
        setShowSuggestions(false);
        setErrors((prev) => ({ ...prev, bankName: "No matching bank found. Please check the name." }));
      }
    } catch (error) {
      setBankSuggestions([]);
      setShowSuggestions(false);
      setErrors((prev) => ({ ...prev, bankName: "Error validating bank name." }));
    }
  };

  const debouncedValidateBankName = useCallback(debounce(validateBankName, 300), [formData.paymentMethod]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (name === "bankName") {
      debouncedValidateBankName(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, bankName: suggestion.name });
    setShowSuggestions(false);
    setErrors({ ...errors, bankName: "" });
  };

  const validateStep = () => {
    const newErrors = {};
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment Method is required";
    }
    if (formData.paymentMethod === "momo") {
      if (!formData.momoNumber) {
        newErrors.momoNumber = "Mobile Money number is required";
      } else if (!/^\+?\d{10,15}$/.test(formData.momoNumber)) {
        newErrors.momoNumber = "Mobile Money number must be 10-15 digits";
      }
      if (!formData.momoProvider) {
        newErrors.momoProvider = "Mobile Money provider is required";
      }
    }
    if (formData.paymentMethod === "bank") {
      if (!formData.bankName) {
        newErrors.bankName = "Bank name is required";
      }
      if (!formData.bankAccountName) {
        newErrors.bankAccountName = "Bank account name is required";
      }
      if (!formData.bankAccountNumber) {
        newErrors.bankAccountNumber = "Bank account number is required";
      } else if (!/^\d{8,50}$/.test(formData.bankAccountNumber)) {
        newErrors.bankAccountNumber = "Bank account number must be 8-50 digits";
      }
    }
    if (formData.paymentMethod === "paypal") {
      if (!formData.momoNumber) {
        newErrors.momoNumber = "PayPal email or phone is required";
      } else if (!/^\S+@\S+\.\S+$|^\+?\d{10,15}$/.test(formData.momoNumber)) {
        newErrors.momoNumber = "Enter a valid email or phone number";
      }
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateStep();
    if (!isValid) {
      Swal.fire({
        title: "Error!",
        text: "Please correct the errors before submitting.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-900 text-white",
          title: "text-white",
          content: "text-white",
          confirmButton: "bg-gray-700 hover:bg-gray-600",
        },
        buttonsStyling: false,
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${hasPaymentMethod ? "update" : "add"} your payment details?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${hasPaymentMethod ? "update" : "add"} it!`,
      cancelButtonText: "Cancel",
      customClass: {
        popup: "bg-gray-900 text-white",
        title: "text-white",
        content: "text-white",
        confirmButton: "bg-indigo-600 hover:bg-indigo-700",
        cancelButton: "bg-gray-600 hover:bg-gray-700",
      },
      buttonsStyling: false,
    });

    if (confirmResult.isConfirmed) {
      setIsSubmitting(true);
      const payload = {
        payment_method: formData.paymentMethod,
        momo_number: formData.momoNumber || null,
        momo_provider: formData.momoProvider || null,
        bank_name: formData.bankName || null,
        bank_account_name: formData.bankAccountName || null,
        bank_account_number: formData.bankAccountNumber || null,
        country: formData.country,
        currency: formData.currency,
      };

      try {
        const response = await axiosClient.put("/api/v1/vendor/payment-method/", payload);
        await Swal.fire({
          title: hasPaymentMethod ? "Updated!" : "Added!",
          text: `Your payment details have been successfully ${hasPaymentMethod ? "updated" : "added"}.`,
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: "bg-gray-900 text-white",
            title: "text-white",
            content: "text-white",
            confirmButton: "bg-green-600 hover:bg-green-700",
          },
          buttonsStyling: false,
        });
        setHasPaymentMethod(true);
        fetchPaymentDetail();
      } catch (error) {
        let errorMessage = `Something went wrong while ${hasPaymentMethod ? "updating" : "adding"} your payment details.`;
        if (error.response && error.response.data) {
          setErrors(error.response.data);
          errorMessage = Object.values(error.response.data).flat().join(" ");
        }
        await Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "bg-gray-900 text-white",
            title: "text-white",
            content: "text-white",
            confirmButton: "bg-red-600 hover:bg-red-700",
          },
          buttonsStyling: false,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    fetchPaymentDetail();
    return () => {
      debouncedValidateBankName.cancel();
    };
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: pageTitle },
      ]}
    >
      <div className="min-h-screen py-8 px-0 sm:px-0 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl shadow-0 p-6 sm:p-8"
          >
            <div className="flex items-center mb-6">
              <BanknotesIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <h5 className="text-lg font-bold">
                {hasPaymentMethod ? "Update Your Payment Method" : "Set Up Your Payment Method"}
              </h5>
            </div>

            {hasPaymentMethod && (
              <div className={`mb-4 p-2 rounded border ${getStatusStyles(paymentStatus)}`}>
                <p className="font-semibold">
                  Payment Method Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.paymentMethod ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  >
                    <option value="momo">Mobile Money</option>
                    <option value="bank">Bank Transfer</option>
                    {/* <option value="paypal">PayPal</option> */}
                  </select>
                  <BanknotesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </motion.div>

              <AnimatePresence mode="wait">
                {formData.paymentMethod === "momo" && (
                  <motion.div
                    key="momo"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1 text-indigo-600" />
                        Mobile Money Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="momoNumber"
                        value={formData.momoNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.momoNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your mobile money number"
                      />
                      {errors.momoNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.momoNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mobile Money Provider <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="momoProvider"
                        value={formData.momoProvider}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.momoProvider ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select provider</option>
                        <option value="MTN">MTN</option>
                        <option value="VODAFONE">Vodafone</option>
                        <option value="AIRTELTIGO">AirtelTigo</option>
                      </select>
                      {errors.momoProvider && (
                        <p className="mt-1 text-sm text-red-600">{errors.momoProvider}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {formData.paymentMethod === "paypal" && (
                  <motion.div
                    key="paypal"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1 text-indigo-600" />
                        PayPal Email or Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="momoNumber"
                        value={formData.momoNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.momoNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your PayPal email or phone"
                      />
                      {errors.momoNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.momoNumber}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {formData.paymentMethod === "bank" && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1 text-indigo-600" />
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.bankName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter bank name"
                      />
                      {showSuggestions && bankSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
                          {bankSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion.name}
                            </li>
                          ))}
                        </ul>
                      )}
                      {errors.bankName && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <UserIcon className="h-4 w-4 mr-1 text-indigo-600" />
                        Account Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankAccountName"
                        value={formData.bankAccountName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.bankAccountName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter account holder name"
                      />
                      {errors.bankAccountName && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankAccountName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <HashtagIcon className="h-4 w-4 mr-1 text-indigo-600" />
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.bankAccountNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter account number"
                      />
                      {errors.bankAccountNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankAccountNumber}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <GlobeAltIcon className="h-4 w-4 mr-1 text-indigo-600" />
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.country ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="GH">Ghana</option>
                  <option value="US">United States</option>
                  <option value="EU">European Union</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-indigo-600" />
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.currency ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="GHS">Ghanaian Cedi (GHS)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    {hasPaymentMethod ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  hasPaymentMethod ? "Update Payment Details" : "Add Payment Details"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PaymentForm;
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// interface FormData {
//   name: string;
//   email: string;
//   phone: string;
//   street: string;
//   city: string;
//   zip: string;
// }

// Define Zod schema for validation
const formDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().min(1, 'Phone is required').regex(/^\+?[0-9\s\-()]{7,}$/, 'Invalid phone number'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zip: z.string().min(1, 'Zip is required'),
});

type FormDataSchema = z.infer<typeof formDataSchema>;

const AddUserPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormDataSchema>({
    resolver: zodResolver(formDataSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      zip: '',
    },
  });

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'email', 'phone']);
    } else if (step === 2) {
      isValid = await trigger(['street', 'city', 'zip']);
    }
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const onSubmit: SubmitHandler<FormDataSchema> = (data) => {
    const newUser = { ...data, id: Date.now() };
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    localUsers.push(newUser);
    localStorage.setItem('localUsers', JSON.stringify(localUsers));
    console.log('User Data:', newUser);

    toast.success('User added successfully!');

    router.push('/dashboard');
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Add User</h1>
      <form className="bg-white p-6 rounded shadow">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="border rounded px-3 py-2 w-full"
                />
                {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name.message}</div>}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="border rounded px-3 py-2 w-full"
                />
                {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email.message}</div>}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="border rounded px-3 py-2 w-full"
                />
                {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone.message}</div>}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium">Street</label>
                <input
                  type="text"
                  {...register('street')}
                  className="border rounded px-3 py-2 w-full"
                />
                {errors.street && <div className="text-red-600 text-sm mt-1">{errors.street.message}</div>}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">City</label>
                <input
                  type="text"
                  {...register('city')}
                  className="border rounded px-3 py-2 w-full"
                />
                {errors.city && <div className="text-red-600 text-sm mt-1">{errors.city.message}</div>}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Zip</label>
                <input
                  type="text"
                  {...register('zip')}
                  className="border rounded px-3 py-2 w-full"
                />
                {errors.zip && <div className="text-red-600 text-sm mt-1">{errors.zip.message}</div>}
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <h2 className="font-semibold mb-2">Review Information</h2>
                <ul className="text-gray-700">
                  <li><span className="font-medium">Name:</span> {getValues('name')}</li>
                  <li><span className="font-medium">Email:</span> {getValues('email')}</li>
                  <li><span className="font-medium">Phone:</span> {getValues('phone')}</li>
                  <li><span className="font-medium">Street:</span> {getValues('street')}</li>
                  <li><span className="font-medium">City:</span> {getValues('city')}</li>
                  <li><span className="font-medium">Zip:</span> {getValues('zip')}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="mr-2 px-4 py-2 border rounded"
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Confirm & Add
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage; 
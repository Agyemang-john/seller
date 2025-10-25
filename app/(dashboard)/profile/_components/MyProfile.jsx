'use client';

import * as React from 'react';
import { useEffect, useState } from "react";
import { createAxiosClient } from '@/utils/clientFetch';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Swal from 'sweetalert2';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import toast from 'react-hot-toast';


export default function MyProfile() {
  const axiosClient = createAxiosClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendor_name, setVendorName] = useState('');
  const [address, setAddressLine] = useState('');
  const [about, setBio] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [facebook_url, setFacebookUrl] = useState('');
  const [instagram_url, setInstagramUrl] = useState('');
  const [twitter_url, setTwitterUrl] = useState('');
  const [linkedin_url, setLinkedInUrl] = useState('');
  const [profile_image, setProfileImage] = useState(null);
  const [cover_image, setCoverImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});

  const API_KEY = 'pk.ac7f55c6c458a12ea5ed586db0b1bb4d'; // Replace with your LocationIQ API key

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/api/v1/vendor/about/management/`);
      const data = response.data;
      setVendorName(data.vendor_name || '');
      setAddressLine(data.address || '');
      setBio(data.about || '');
      setLatitude(data.latitude || '');
      setLongitude(data.longitude || '');
      setProfileImagePreview(data.profile_image ? `${data.profile_image}` : '');
      setCoverImagePreview(data.cover_image ? `${data.cover_image}` : '');
      setFacebookUrl(data.facebook_url || '');
      setInstagramUrl(data.instagram_url || '');
      setTwitterUrl(data.twitter_url || '');
      setLinkedInUrl(data.linkedin_url || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(`https://api.locationiq.com/v1/autocomplete.php`, {
        params: { key: API_KEY, q: query, format: 'json' },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleChangeInput = async (event) => {
    const value = event.target.value;
    setAddressLine(value);
    if (value.length > 2) {
      await fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setAddressLine(suggestion.display_name);
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lon);
    setSuggestions([]);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('vendor_name', vendor_name);
        formData.append('address', address);
        formData.append('about', about);
        formData.append('latitude', latitude || null);
        formData.append('longitude', longitude || null);
        formData.append('facebook_url', facebook_url || '');
        formData.append('instagram_url', instagram_url || '');
        formData.append('twitter_url', twitter_url || '');
        formData.append('linkedin_url', linkedin_url || '');
        if (profile_image instanceof File) formData.append('profile_image', profile_image);
        if (cover_image instanceof File) formData.append('cover_image', cover_image);

        try {
          const response = await axiosClient.put('/api/v1/vendor/about/management/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          Swal.fire("Saved!", "Your profile has been updated successfully.", "success");
          setProfileImage(null);
          setCoverImage(null);
          fetchVendorProfile();
        } catch (error) {
          const errorData = error.response?.data || {};
          setErrors({
            vendor_name: errorData.vendor_name?.join(', '),
            address: errorData.address?.join(', '),
            about: errorData.about?.join(', '),
            latitude: errorData.latitude?.join(', '),
            longitude: errorData.longitude?.join(', '),
            profile_image: errorData.profile_image?.join(', '),
            cover_image: errorData.cover_image?.join(', '),
            facebook_url: errorData.facebook_url?.join(', '),
            instagram_url: errorData.instagram_url?.join(', '),
            twitter_url: errorData.twitter_url?.join(', '),
            linkedin_url: errorData.linkedin_url?.join(', '),
            non_field_errors: errorData.non_field_errors?.join(', '),
          });
          toast.error(errorData.non_field_errors?.join(', ') || 'Failed to update profile.');
          Swal.fire("Error!", errorData.non_field_errors?.join(', ') || "There was an issue updating your profile.", "error");
        }
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', padding: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ marginRight: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="60%" sx={{ marginBottom: 1 }} />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Box>
        <Skeleton variant="text" width="80%" sx={{ marginBottom: 1 }} />
        <Skeleton variant="rectangular" height={100} />
      </Box>
    );
  }

  if (!vendor_name) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', padding: 3 }}>
        <Typography variant="h6">Profile not available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Stack
        spacing={2}
        sx={{
          // maxWidth: '800px',
          mx: 'auto',
          px: { xs: 1, sm: 2 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ p: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h5">Store info</Typography>
            <Typography variant="body1">
              Customize how your Storefront information.
            </Typography>
          </Box>
          <Divider />

          {errors.non_field_errors && (
            <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.main', borderRadius: 1, mb: 2 }}>
              {errors.non_field_errors}
            </Box>
          )}

          <Stack spacing={3} sx={{ my: 2 }}>
            {/* Cover Image */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '25%',
                maxHeight: 200,
                borderRadius: '0%',
                overflow: 'hidden',
              }}
            >
              <img
                src={coverImagePreview || `${cover_image}` || '/default-cover.jpg'}
                alt="Cover Preview"
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '0%',
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImage}
                style={{ display: 'none' }}
                id="cover-image-upload"
              />
              <IconButton
                component="label"
                htmlFor="cover-image-upload"
                aria-label="Upload new cover picture"
                size="sm"
                variant="outlined"
                color="info"
                sx={{
                  bgcolor: 'white',
                  position: 'absolute',
                  zIndex: 5,
                  borderRadius: '50%',
                  right: 10,
                  top: 10,
                  boxShadow: 'lg',
                }}
              >
                <EditRoundedIcon />
              </IconButton>
            </Box>

            {/* Profile Image and Form */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
            >
              <Stack direction="column" spacing={1} alignItems="center" sx={{ position: 'relative' }}>
                <Avatar
                  src={profileImagePreview || `${profile_image}` || '/default-profile.jpg'}
                  alt="Profile Preview"
                  sx={{
                    width: { xs: 120, sm: 180 },
                    height: { xs: 120, sm: 180 },
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                />
                <IconButton
                  component="label"
                  htmlFor="profile-image-upload"
                  aria-label="Upload new picture"
                  size="sm"
                  variant="outlined"
                  color="info"
                  sx={{
                    bgcolor: 'white',
                    position: 'absolute',
                    zIndex: 5,
                    borderRadius: '50%',
                    right: 10,
                    top: 110,
                    boxShadow: 'lg',
                  }}
                >
                  <EditRoundedIcon />
                </IconButton>
              </Stack>

              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <FormControl>
                  <FormLabel>Store Name</FormLabel>
                  <Input
                    size="lg"
                    value={vendor_name}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Store name"
                    required
                    error={!!errors.vendor_name}
                  />
                  {errors.vendor_name && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.vendor_name}
                    </Typography>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Input size="sm" readOnly value="Vendor/Seller" />
                </FormControl>

                <FormControl>
                  <FormLabel>Where's your store?</FormLabel>
                  <Input
                    size="lg"
                    value={address}
                    onChange={handleChangeInput}
                    placeholder="AddressLine"
                    required
                    error={!!errors.address}
                  />
                  {errors.address && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.address}
                    </Typography>
                  )}
                </FormControl>

                {suggestions.length > 0 && (
                  <Stack spacing={1} sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                    {suggestions.map((suggestion, index) => (
                      <Box key={index}>
                        <Link
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{ cursor: 'pointer', display: 'block', py: 0.5 }}
                        >
                          {suggestion.display_name}
                        </Link>
                        <Divider />
                      </Box>
                    ))}
                  </Stack>
                )}

                <FormControl>
                  <FormLabel>Facebook URL</FormLabel>
                  <Input
                    size="lg"
                    value={facebook_url}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    type="url"
                    error={!!errors.facebook_url}
                  />
                  {errors.facebook_url && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.facebook_url}
                    </Typography>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Instagram URL</FormLabel>
                  <Input
                    size="lg"
                    value={instagram_url}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourpage"
                    type="url"
                    error={!!errors.instagram_url}
                  />
                  {errors.instagram_url && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.instagram_url}
                    </Typography>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>X(Twitter) URL</FormLabel>
                  <Input
                    size="lg"
                    value={twitter_url}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/yourpage"
                    type="url"
                    error={!!errors.twitter_url}
                  />
                  {errors.twitter_url && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.twitter_url}
                    </Typography>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <Input
                    size="lg"
                    value={linkedin_url}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourpage"
                    type="url"
                    error={!!errors.linkedin_url}
                  />
                  {errors.linkedin_url && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.linkedin_url}
                    </Typography>
                  )}
                </FormControl>

                <Box sx={{ mb: 1 }}>
                  <Typography level="title-md">Bio</Typography>
                  <Typography level="body-sm">
                    Write a short introduction to be displayed on your Storefront
                  </Typography>
                </Box>
                <Divider />
                <FormControl>
                  <TextareaAutosize
                    minRows={4}
                    value={about}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="About Store"
                    style={{ width: '100%', padding: 8, borderRadius: 4 }}
                    className={errors.about ? 'border-red-500' : ''}
                  />
                  {errors.about && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.about}
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </Stack>

            <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
              <Button
                size="sm"
                onClick={() => router.back()}
                variant="outlined"
                color="neutral"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                size="sm"
                variant="solid"
              >
                Save
              </Button>
            </CardActions>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
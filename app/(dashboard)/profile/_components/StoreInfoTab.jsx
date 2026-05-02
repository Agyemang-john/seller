'use client';

import { useEffect, useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import axios from 'axios';
import Swal from 'sweetalert2';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const LOCATIONIQ_KEY = 'pk.ac7f55c6c458a12ea5ed586db0b1bb4d';

export default function StoreInfoTab() {
  const axiosClient = createAxiosClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    vendor_name: '',
    address: '',
    about: '',
    latitude: '',
    longitude: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/v1/vendor/about/management/');
      const d = res.data;
      setForm({
        vendor_name: d.vendor_name || '',
        address: d.address || '',
        about: d.about || '',
        latitude: d.latitude || '',
        longitude: d.longitude || '',
        facebook_url: d.facebook_url || '',
        instagram_url: d.instagram_url || '',
        twitter_url: d.twitter_url || '',
        linkedin_url: d.linkedin_url || '',
      });
      setProfilePreview(d.profile_image || '');
      setCoverPreview(d.cover_image || '');
    } catch {
      toast.error('Failed to load store profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const fetchSuggestions = async (q) => {
    try {
      const res = await axios.get('https://api.locationiq.com/v1/autocomplete.php', {
        params: { key: LOCATIONIQ_KEY, q, format: 'json' },
      });
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    }
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, address: value }));
    if (value.length > 2) await fetchSuggestions(value);
    else setSuggestions([]);
  };

  const handleSuggestionClick = (s) => {
    setForm(prev => ({ ...prev, address: s.display_name, latitude: s.lat, longitude: s.lon }));
    setSuggestions([]);
  };

  const handleImageFile = (file, type) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') { setProfileImage(file); setProfilePreview(reader.result); }
      else { setCoverImage(file); setCoverPreview(reader.result); }
    };
    reader.readAsDataURL(file);
  };

  const doSave = async () => {
    setErrors({});
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (profileImage instanceof File) fd.append('profile_image', profileImage);
    if (coverImage instanceof File) fd.append('cover_image', coverImage);

    try {
      await axiosClient.put('/api/v1/vendor/about/management/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Store profile updated!');
      setProfileImage(null);
      setCoverImage(null);
      fetchProfile();
    } catch (err) {
      const data = err.response?.data || {};
      setErrors(data);
      const firstErr = Object.values(data)[0];
      toast.error(Array.isArray(firstErr) ? firstErr[0] : (firstErr || 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => setConfirmOpen(true);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Stack>
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={48} />
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {/* Images */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Store Images</Typography>
          <Divider sx={{ mb: 2.5 }} />

          {/* Cover image */}
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '22%', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', mb: 2 }}>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <input type="file" accept="image/*" id="cover-upload" style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0], 'cover')} />
            <IconButton
              component="label"
              htmlFor="cover-upload"
              sx={{ position: 'absolute', right: 10, top: 10, bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}
              size="small"
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
            {!coverPreview && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">Click pencil to upload cover image</Typography>
              </Box>
            )}
          </Box>

          {/* Profile image */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={profilePreview} sx={{ width: 96, height: 96, fontSize: 32, bgcolor: 'primary.main' }}>
                {!profilePreview && form.vendor_name.charAt(0).toUpperCase()}
              </Avatar>
              <input type="file" accept="image/*" id="profile-upload" style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0], 'profile')} />
              <IconButton
                component="label"
                htmlFor="profile-upload"
                size="small"
                sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}
              >
                <EditRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>{form.vendor_name || 'Your Store'}</Typography>
              <Typography variant="caption" color="text.secondary">JPG, PNG or GIF · Max 5 MB recommended</Typography>
            </Box>
          </Stack>
        </Card>

        {/* Store details */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Store Details</Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2.5}>
            <FormControl error={!!errors.vendor_name}>
              <FormLabel>Store Name *</FormLabel>
              <Input
                name="vendor_name"
                value={form.vendor_name}
                onChange={handleField}
                placeholder="Your store name"
                fullWidth
              />
              {errors.vendor_name && <Typography variant="caption" color="error">{errors.vendor_name}</Typography>}
            </FormControl>

            <FormControl error={!!errors.address} sx={{ position: 'relative' }}>
              <FormLabel>Store Address</FormLabel>
              <Input
                name="address"
                value={form.address}
                onChange={handleAddressChange}
                placeholder="Start typing your address…"
                fullWidth
              />
              {errors.address && <Typography variant="caption" color="error">{errors.address}</Typography>}
              {suggestions.length > 0 && (
                <Box sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 200, overflowY: 'auto', boxShadow: 3 }}>
                  {suggestions.map((s, i) => (
                    <Box key={i}>
                      <Link
                        component="button"
                        onClick={() => handleSuggestionClick(s)}
                        underline="none"
                        sx={{ display: 'block', width: '100%', textAlign: 'left', px: 2, py: 1, fontSize: 13, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        {s.display_name}
                      </Link>
                      {i < suggestions.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <FormControl error={!!errors.about}>
              <FormLabel>About / Bio</FormLabel>
              <TextareaAutosize
                name="about"
                value={form.about}
                onChange={handleField}
                minRows={4}
                placeholder="Tell customers about your store…"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${errors.about ? '#d32f2f' : '#ccc'}`,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              {errors.about && <Typography variant="caption" color="error">{errors.about}</Typography>}
            </FormControl>
          </Stack>
        </Card>

        {/* Social media */}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Social Media</Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2}>
            {[
              { name: 'facebook_url', label: 'Facebook', icon: <FacebookIcon sx={{ color: '#1877f2' }} />, placeholder: 'https://facebook.com/yourpage' },
              { name: 'instagram_url', label: 'Instagram', icon: <InstagramIcon sx={{ color: '#e1306c' }} />, placeholder: 'https://instagram.com/yourpage' },
              { name: 'twitter_url', label: 'X / Twitter', icon: <TwitterIcon sx={{ color: 'text.primary' }} />, placeholder: 'https://x.com/yourhandle' },
              { name: 'linkedin_url', label: 'LinkedIn', icon: <LinkedInIcon sx={{ color: '#0a66c2' }} />, placeholder: 'https://linkedin.com/in/yourprofile' },
            ].map(({ name, label, icon, placeholder }) => (
              <FormControl key={name} error={!!errors[name]}>
                <FormLabel>{label}</FormLabel>
                <Input
                  name={name}
                  value={form[name]}
                  onChange={handleField}
                  placeholder={placeholder}
                  startAdornment={<InputAdornment position="start">{icon}</InputAdornment>}
                  fullWidth
                />
                {errors[name] && <Typography variant="caption" color="error">{errors[name]}</Typography>}
              </FormControl>
            ))}
          </Stack>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ px: 4 }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Stack>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Save changes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Your store profile will be updated with the current information.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { setConfirmOpen(false); doSave(); }}
            disabled={saving}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

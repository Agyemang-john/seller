
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SellerDashboardGuide = () => {
  return (
    <Box >
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Seller Dashboard Guide
      </Typography>
      <Typography variant="body1" paragraph align="center" color="textSecondary">
        Welcome to your seller dashboard! This guide will help you add, edit, and manage products effectively. Follow these best practices inspired by Negromart to ensure your listings are approved and perform well.
      </Typography>

      <Accordion defaultExpanded sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">1. Adding a Product</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Follow these rules to create high-quality product listings. Titles and images must comply with guidelines to avoid rejection.
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Product Title Guidelines</Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Capitalize Important Words"
                  secondary="Use title case: Each major word starts with a capital letter (e.g., 'Wireless Bluetooth Headphones'). Do not include variants like size or color in the title (e.g., avoid 'Headphones Size Large, Color Red')."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Keep It Concise and Specific"
                  secondary="Titles should be under 150 characters. Be descriptive but avoid repetition or merchant names. Structure: Brand + Product Name + Model + Key Features (e.g., 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones')."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Abbreviate Measurements"
                  secondary="Use abbreviations like 'in' for inches, 'oz' for ounces. Avoid special characters like !, $, {}, ?."
                />
              </ListItem>
            </List>
          </Paper>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Steps to Add a Product</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. Click 'Add Product' in the dashboard." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Enter product details: title, slug(auto generated), variant( type one of these; None, Size, Color, Size-Color), 
                brand(select one), Category(select one), Where you will ship this product to(Select as many regions as you want), 
                price, old-price(must be higher than price), manufactured date, 
                weight(leave it if you don't know), volume(leave it if you don't know), 
                product type(new, refurbished, used), available quantity, description, features, specifications, delivery and returns" />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Upload main image (white/plain background, 1000px+ resolution, fills 85% of frame). Must have same height and width" />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Add variants (size, color, size-color) if applicable, but keep title variant-free." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. Set delivery options and save. Review for compliance before submitting." />
              </ListItem>
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">2. Editing a Product</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Edit products to update details, images, or pricing. Always re-check title and image compliance.
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Steps to Edit</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. Select a product from your list and click 'Edit'." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Modify title (keep under 200 chars, title case, no variants)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Update images (white background, high-res, fills 85% frame)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Adjust price, description, or variants as needed." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. Save changes. Re-submit if previously rejected." />
              </ListItem>
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">3. Deleting a Product</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Delete products that are no longer relevant. This removes them from your catalog.
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Steps to Delete</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. Select the product and click 'Delete'." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Confirm the action (irreversible)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. The product is removed from your listings." />
              </ListItem>
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">4. Adding Additional Images</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Add up to 9 images per product to showcase details. Main image must be white/plain background.
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Image Requirements</Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="White/Plain Background"
                  secondary="Main image must have a seamless white background. Additional images can show product in use, but avoid clutter. Use tools like Unsplash or Pinterest for plain background images."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="High Resolution"
                  secondary="At least 1000px on longest side, fills 85% of frame, no blur. Formats: JPEG, PNG, BMP. Max 5MB."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Up to 9 Images"
                  secondary="Main image first, then lifestyle/zoom shots. Color mode: sRGB or CMYK."
                />
              </ListItem>
            </List>
          </Paper>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Steps to Add Images</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. In product edit, scroll to 'Images' section." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Upload main image (white background, high-res)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Add additional images (up to 8, varied angles)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Ensure images match title and description." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. Save. Images are reviewed for compliance." />
              </ListItem>
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">5. Adding Variants</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Variants allow customers to choose sizes, colors, etc. Keep the main title variant-free.
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Variant Rules</Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="No Variants in Title"
                  secondary="Title should not include size/color (e.g., 'Shirt' not 'Shirt Size M, Color Blue'). Use variants for options."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Supported Types"
                  secondary="None, Size, Color, Size-Color. Set in product settings."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Images per Variant"
                  secondary="Upload unique images for each variant (white background for main)."
                />
              </ListItem>
            </List>
          </Paper>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Steps to Add Variants</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. Edit product and select variant type (e.g., Size-Color)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Add variant details: size (e.g., S, M, L), color (e.g., Red, Blue), price." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Upload variant-specific images (white background)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Set quantity per variant and save." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. Review: Title remains variant-free, images comply." />
              </ListItem>
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">6. Adding Delivery Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Delivery options let customers choose shipping speed. Set costs, days, and availability.
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Delivery Rules</Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Set Realistic Times"
                  secondary="Min/Max days (e.g., Standard: 2-5 days, Express: 1-2 days). Include packaging/delivery fees."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Cost Structure"
                  secondary="Base cost + distance-based fees. Ensure transparency for customers."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Images/Descriptions"
                  secondary="Describe options clearly (e.g., 'Free Standard Shipping')."
                />
              </ListItem>
            </List>
          </Paper>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Steps to Add Delivery Options</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="1. Go to 'Delivery Options' in dashboard." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. Click 'Add Option' and set name (e.g., Standard), cost, min/max days." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. Assign to products via 'Product Delivery Options'." />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. Set as default for new products if needed." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. Save. Options appear in customer checkout." />
              </ListItem>
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        Need help? Contact support or refer to Negromart seller resources for more details.
      </Typography>
    </Box>
  );
};

export default SellerDashboardGuide;

import React, { useState } from "react";
import { NextPage } from "next";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import withLayoutMain from "@/libs/components/layout/LayoutMember";

const CommunityCreate: NextPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    category: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Free", "Recommend", "News", "Question"];

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      category: "",
      content: "",
    };

    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
      isValid = false;
    } else if (formData.content.length < 50) {
      newErrors.content = "Content must be at least 50 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const articleData = new FormData();
      articleData.append("title", formData.title);
      articleData.append("category", formData.category);
      articleData.append("content", formData.content);
      if (formData.image) {
        articleData.append("image", formData.image);
      }

      console.log("Article data:", {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        image: formData.image?.name,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to community page after successful creation
      router.push("/community");
    } catch (error) {
      console.error("Error creating article:", error);
      alert("Failed to create article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      formData.title ||
      formData.content ||
      formData.image ||
      formData.category
    ) {
      if (
        confirm("Are you sure you want to cancel? Your changes will be lost.")
      ) {
        router.push("/community");
      }
    } else {
      router.push("/community");
    }
  };

  return (
    <div id="community-create-page">
      <Stack className="create-container">
        <Stack className="create-content">
          {/* Header */}
          <Stack className="create-header">
            <Typography className="page-title">Write New Article</Typography>
            <Typography className="page-subtitle">
              Share your knowledge and insights with the community
            </Typography>
          </Stack>

          {/* Form */}
          <Stack className="create-form">
            {/* Title */}
            <Stack className="form-section">
              <Typography className="section-label">
                Title <span className="required">*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter an engaging title for your article..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                className="form-input"
                inputProps={{ maxLength: 150 }}
              />
              <Typography className="char-count">
                {formData.title.length}/150
              </Typography>
            </Stack>

            {/* Category */}
            <Stack className="form-section">
              <Typography className="section-label">
                Category <span className="required">*</span>
              </Typography>
              <FormControl fullWidth error={!!errors.category}>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  displayEmpty
                  className="category-select"
                >
                  <MenuItem value="" disabled>
                    Select a category
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography className="error-text">
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Stack>

            {/* Image Upload */}
            <Stack className="form-section">
              <Typography className="section-label">
                Cover Image (Optional)
              </Typography>
              {!imagePreview ? (
                <Box className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<ImageIcon />}
                      className="upload-btn"
                    >
                      Upload Image
                    </Button>
                  </label>
                  <Typography className="upload-info">
                    Recommended size: 1200x630px (Max 5MB)
                  </Typography>
                </Box>
              ) : (
                <Box className="image-preview-box">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Stack>

            {/* Content */}
            <Stack className="form-section">
              <Typography className="section-label">
                Content <span className="required">*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={16}
                placeholder="Write your article content here...

You can use basic formatting:
- Start paragraphs with a blank line
- Use ** for bold text
- Use * for italic text
- Use - or * for bullet points"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                error={!!errors.content}
                helperText={errors.content}
                className="content-input"
              />
              <Typography className="char-count">
                {formData.content.length} characters
              </Typography>
            </Stack>

            {/* Preview Section */}
            {formData.content && (
              <Stack className="form-section">
                <Typography className="section-label">Preview</Typography>
                <Box className="content-preview">
                  <Typography className="preview-title">
                    {formData.title || "Untitled Article"}
                  </Typography>
                  <Typography className="preview-content">
                    {formData.content}
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Tips */}
            <Alert severity="info" className="tips-alert">
              <Typography className="tips-title">Writing Tips:</Typography>
              <ul className="tips-list">
                <li>Write a clear and descriptive title</li>
                <li>Choose the most appropriate category</li>
                <li>Structure your content with paragraphs</li>
                <li>Add an engaging cover image if possible</li>
                <li>Proofread before publishing</li>
              </ul>
            </Alert>

            {/* Actions */}
            <Stack className="form-actions">
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="cancel-btn"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? "Publishing..." : "Publish Article"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutMain(CommunityCreate);

#!/bin/bash

# AWS S3 Static Website Deployment Script
# =====================================
# 
# Prerequisites:
# 1. AWS CLI installed and configured
# 2. S3 bucket created and configured for static website hosting
# 3. CloudFront distribution (optional but recommended)
# 4. Route 53 domain (optional)

# Configuration
BUCKET_NAME="your-portfolio-bucket"
CLOUDFRONT_DISTRIBUTION_ID="E1234567890123"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

print_status "Starting deployment to AWS S3..."

# Sync files to S3 bucket
print_status "Uploading files to S3 bucket: $BUCKET_NAME"
aws s3 sync . s3://$BUCKET_NAME \
    --region $REGION \
    --delete \
    --exclude ".git/*" \
    --exclude ".github/*" \
    --exclude "*.sh" \
    --exclude "*.md" \
    --exclude "node_modules/*" \
    --exclude ".DS_Store" \
    --exclude "Thumbs.db"

if [ $? -eq 0 ]; then
    print_status "Files uploaded successfully to S3!"
else
    print_error "Failed to upload files to S3"
    exit 1
fi

# Set proper content types and cache headers
print_status "Setting content types and cache headers..."

# HTML files - no cache
aws s3 cp s3://$BUCKET_NAME/index.html s3://$BUCKET_NAME/index.html \
    --metadata-directive REPLACE \
    --content-type "text/html" \
    --cache-control "public, max-age=0, must-revalidate" \
    --region $REGION

# CSS files - long cache
for file in $(aws s3 ls s3://$BUCKET_NAME/assets/css/ --recursive | awk '{print $4}'); do
    aws s3 cp s3://$BUCKET_NAME/$file s3://$BUCKET_NAME/$file \
        --metadata-directive REPLACE \
        --content-type "text/css" \
        --cache-control "public, max-age=31536000, immutable" \
        --region $REGION
done

# JavaScript files - long cache
for file in $(aws s3 ls s3://$BUCKET_NAME/assets/js/ --recursive | awk '{print $4}'); do
    aws s3 cp s3://$BUCKET_NAME/$file s3://$BUCKET_NAME/$file \
        --metadata-directive REPLACE \
        --content-type "application/javascript" \
        --cache-control "public, max-age=31536000, immutable" \
        --region $REGION
done

# Images - long cache
for file in $(aws s3 ls s3://$BUCKET_NAME/assets/images/ --recursive | awk '{print $4}'); do
    if [[ $file == *.jpg ]]; then
        content_type="image/jpeg"
    elif [[ $file == *.png ]]; then
        content_type="image/png"
    elif [[ $file == *.webp ]]; then
        content_type="image/webp"
    else
        content_type="application/octet-stream"
    fi
    
    aws s3 cp s3://$BUCKET_NAME/$file s3://$BUCKET_NAME/$file \
        --metadata-directive REPLACE \
        --content-type "$content_type" \
        --cache-control "public, max-age=31536000, immutable" \
        --region $REGION
done

# PDF files
aws s3 cp s3://$BUCKET_NAME/assets/resume.pdf s3://$BUCKET_NAME/assets/resume.pdf \
    --metadata-directive REPLACE \
    --content-type "application/pdf" \
    --cache-control "public, max-age=86400" \
    --region $REGION

print_status "Content types and cache headers set successfully!"

# Invalidate CloudFront distribution if provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "Creating CloudFront invalidation..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --region $REGION
    
    if [ $? -eq 0 ]; then
        print_status "CloudFront invalidation created successfully!"
    else
        print_warning "Failed to create CloudFront invalidation"
    fi
else
    print_warning "No CloudFront distribution ID provided, skipping invalidation"
fi

# Set bucket policy for public read access
print_status "Setting bucket policy for public access..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
            "Condition": {
                "StringEquals": {
                    "s3:ExistingObjectTag/Environment": "Production"
                }
            }
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://bucket-policy.json \
    --region $REGION

# Clean up temporary policy file
rm -f bucket-policy.json

print_status "Deployment completed successfully!"
print_status "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

# Security recommendations
print_warning "Security Recommendations:"
echo "1. Enable CloudTrail for S3 bucket logging"
echo "2. Set up AWS Config rules for compliance"
echo "3. Use CloudFront for HTTPS and better performance"
echo "4. Set up AWS WAF for additional protection"
echo "5. Enable S3 server access logging"
echo "6. Consider using AWS Certificate Manager for SSL"

# Cost optimization tips
print_status "Cost Optimization Tips:"
echo "1. Use S3 Intelligent-Tiering for automatic cost optimization"
echo "2. Set up lifecycle policies for old versions"
echo "3. Enable S3 Transfer Acceleration if needed"
echo "4. Monitor CloudFront usage and costs"
echo "5. Use CloudWatch to set up billing alerts"
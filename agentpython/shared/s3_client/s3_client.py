import boto3
from botocore.exceptions import NoCredentialsError
import os
from typing import Dict, Any

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
)

BUCKET = os.getenv('AWS_S3_RECORDINGS_BUCKET', 'achanvear-recordings-dev')

def upload_video(session_id: str, file_path: str, filename: str) -> Dict[str, str]:
    """
    Sube video grabación a S3
    """
    try:
        s3_key = f"interviews/{session_id}/{filename}"
        s3_client.upload_file(file_path, BUCKET, s3_key)
        
        url = f"https://{BUCKET}.s3.amazonaws.com/{s3_key}"
        return {"s3_key": s3_key, "public_url": url}
    except NoCredentialsError:
        return {"s3_key": "dummy", "public_url": f"https://dummy-s3/{s3_key}"}

def get_video_url(session_id: str, filename: str) -> str:
    s3_key = f"interviews/{session_id}/{filename}"
    return f"https://{BUCKET}.s3.amazonaws.com/{s3_key}"

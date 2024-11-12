import boto3

# Конфигурация подключения к Tebi S3
s3 = boto3.resource(
    service_name='s3',
    aws_access_key_id='bFSqxwvREwGhSwgZ',  # Ваш Access Key
    aws_secret_access_key='FpNFu5tuVremHO8WVbaRHCLZRvWlYKZj6KpxRmRR',  # Ваш Secret Key
    endpoint_url='https://s3.tebi.io'
)

# Укажите имя вашего бакета и путь к файлу, который хотите скачать
bucket_name = 'my-images'
file_key = 'images/9f8ac86c-e6fb-432c-b9a6-50b2a171212d.jpg'  # Замените на путь к файлу в бакете
download_path = 'downloaded-image.jpg'  # Путь на локальной машине, куда хотите скачать файл

# Скачивание файла
s3.Bucket(bucket_name).download_file(file_key, download_path)

print(f'Файл {file_key} успешно скачан и сохранен как {download_path}')

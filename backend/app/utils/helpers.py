from fastapi import UploadFile


async def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    content = await upload_file.read()
    with open(destination, "wb") as f:
        f.write(content)
    await upload_file.close()

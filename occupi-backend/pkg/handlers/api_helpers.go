package handlers

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/nfnt/resize"
	"github.com/sirupsen/logrus"
)

func MultiDeleteImages(ctx *gin.Context, appsession *models.AppSession, containerName string, ids []string) error {
	for _, id := range ids {
		_, err := appsession.AzureClient.DeleteBlob(ctx, configs.GetAzurePFPContainerName(), id, &azblob.DeleteBlobOptions{})

		if err != nil && !strings.Contains(err.Error(), "BlobNotFound") {
			captureError(ctx, err)
			logrus.WithError(err).Error("Failed to delete image")
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return err
		}
	}
	return nil
}

func MultiUploadImages(ctx *gin.Context, appsession *models.AppSession, containerName string, files []models.File) error {
	for _, file := range files {
		// open the file
		fileData, err := os.Open(file.FileName)
		if err != nil {
			deleteTempFiles(files)
			captureError(ctx, err)
			logrus.WithError(err).Error("Failed to open image")
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return err
		}

		if _, err := appsession.AzureClient.UploadFile(ctx, containerName, utils.RemoveImageExtension(file.FileName), fileData, &azblob.UploadFileOptions{}); err != nil {
			deleteTempFiles(files)
			captureError(ctx, err)
			logrus.WithError(err).Error("Failed to upload image")
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return err
		}
	}

	deleteTempFiles(files)
	return nil
}

func ResizeImagesAndReturnAsFiles(ctx *gin.Context, appsession *models.AppSession, fh *multipart.FileHeader, fileName string) ([]models.File, error) {
	imageWidths := []int{constants.ThumbnailWidth, constants.LowWidth, constants.MidWidth, constants.HighWidth}
	var files []models.File

	for _, width := range imageWidths {
		widthV := uint(width)

		var newFileName string

		switch width {
		case constants.ThumbnailWidth:
			newFileName = fileName + constants.ThumbnailRes
		case constants.LowWidth:
			newFileName = fileName + constants.LowRes
		case constants.MidWidth:
			newFileName = fileName + constants.MidRes
		case constants.HighWidth:
			newFileName = fileName + constants.HighRes
		}

		file, err := ResizeImageAndReturnAsFile(ctx, fh, widthV, width == constants.ThumbnailWidth, newFileName)

		if err != nil {
			// delete the temp files
			deleteTempFiles(files)
			return nil, err
		}

		files = append(files, file)
	}

	return files, nil
}

func ResizeImageAndReturnAsFile(ctx *gin.Context, fh *multipart.FileHeader, width uint, thumbnail bool, newFileName string) (models.File, error) {
	const (
		pngExt  = ".png"
		jpgExt  = ".jpg"
		jpegExt = ".jpeg"
	)
	// Check the file extension
	ext := filepath.Ext(fh.Filename)
	ext = utils.RemoveNumbersFromExtension(ext)
	if ext != jpegExt && ext != jpgExt && ext != pngExt {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid file extension",
			"Unsupported file extension. Only .png, .jpg and .jpeg files are allowed",
			"Only .png, .jpg and .jpeg files are allowed",
			nil,
		))
		return models.File{}, nil
	}

	file, err := fh.Open()
	if err != nil {
		return models.File{}, err
	}
	defer func() {
		if ferr := file.Close(); ferr != nil {
			err = ferr
		}
	}()

	img, _, err := image.Decode(file)
	if err != nil {
		return models.File{}, err
	}

	// Resize the image
	var m image.Image
	if !thumbnail {
		m = resize.Resize(width, 0, img, resize.NearestNeighbor)
	} else {
		m = resize.Thumbnail(200, 200, img, resize.NearestNeighbor)
	}

	// Convert the image to bytes
	buf := new(bytes.Buffer)
	switch ext {
	case jpegExt, jpgExt:
		err = jpeg.Encode(buf, m, nil)
		newFileName = newFileName + jpgExt
	case pngExt:
		err = png.Encode(buf, m)
		newFileName = newFileName + pngExt
	default:
		return models.File{}, nil
	}
	if err != nil {
		return models.File{}, err
	}

	// Create a temp file from the bytes
	if errv := os.WriteFile(newFileName, buf.Bytes(), 0644); errv != nil {
		return models.File{}, errv
	}

	newFile, errv := os.OpenFile(newFileName, os.O_RDONLY, 0)

	if errv != nil {
		return models.File{}, errv
	}
	defer func() {
		if ferr := newFile.Close(); ferr != nil {
			err = ferr
		}
	}()

	return models.File{
		FileName: newFileName,
		File:     newFile,
	}, nil
}

// close and delete the temp files
func deleteTempFiles(files []models.File) {
	for _, f := range files {
		if err := os.Remove(f.FileName); err != nil {
			logrus.WithError(err).Error("Failed to delete temp file")
		}
	}
}

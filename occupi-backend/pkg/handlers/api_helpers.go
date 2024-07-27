package handlers

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func PreloadAllImageResolutions(ctx *gin.Context, appsession *models.AppSession, id string) {
	// ***IMPORTANT NOTE ABOUT ERROR HANDLING IN THIS FUNCTION***
	// if an error occurs, its not a big deal
	// this mainly serves as an attempt to cache the image
	// so that it can be served faster when the user requests it
	// if we cannot, we can just serve the image from the database
	// the user will just have to wait a bit longer

	go func() {
		_, err := database.GetImageData(ctx, appsession, id, constants.LowRes)
		if err != nil {
			return
		}
	}()

	go func() {
		_, err := database.GetImageData(ctx, appsession, id, constants.MidRes)
		if err != nil {
			return
		}
	}()

	go func() {
		_, err := database.GetImageData(ctx, appsession, id, constants.HighRes)
		if err != nil {
			return
		}
	}()
}

func PreloadMidAndHighResolutions(ctx *gin.Context, appsession *models.AppSession, id string) {
	// ***IMPORTANT NOTE ABOUT ERROR HANDLING IN THIS FUNCTION***
	// if an error occurs, its not a big deal
	// this mainly serves as an attempt to cache the image
	// so that it can be served faster when the user requests it
	// if we cannot, we can just serve the image from the database
	// the user will just have to wait a bit longer

	go func() {
		_, err := database.GetImageData(ctx, appsession, id, constants.MidRes)
		if err != nil {
			return
		}
	}()

	go func() {
		_, err := database.GetImageData(ctx, appsession, id, constants.HighRes)
		if err != nil {
			return
		}
	}()
}

func PreloadHighResolution(ctx *gin.Context, appsession *models.AppSession, id string) {
	// ***IMPORTANT NOTE ABOUT ERROR HANDLING IN THIS FUNCTION***
	// if an error occurs, its not a big deal
	// this mainly serves as an attempt to cache the image
	// so that it can be served faster when the user requests it
	// if we cannot, we can just serve the image from the database
	// the user will just have to wait a bit longer

	go func() {
		_, err := database.GetImageData(ctx, appsession, id, constants.HighRes)
		if err != nil {
			return
		}
	}()
}

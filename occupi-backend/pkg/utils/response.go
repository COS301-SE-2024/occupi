package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
)

// creates success response and formats it correctly
func SuccessResponse(
	status int,
	message string,
	data interface{},
) gin.H {
	return gin.H{
		"status":  status,
		"message": message,
		"data":    data,
	}
}

// creates success response with meta and formats it correctly
func SuccessResponseWithMeta(
	status int,
	message string,
	data interface{},
	meta gin.H,
) gin.H {
	return gin.H{
		"status":  status,
		"message": message,
		"data":    data,
		"meta":    meta,
	}
}

// creates error response and formats it correctly
func ErrorResponse(
	status int,
	message string,
	code string,
	codeMessage string,
	codeDetailsOptions gin.H,
) gin.H {
	return gin.H{
		"status":  status,
		"message": message,
		"error": gin.H{
			"code":    code,
			"message": codeMessage,
			"details": codeDetailsOptions,
		},
	}
}

// creates internal server error response and formats it correctly
func InternalServerError() gin.H {
	return gin.H{
		"status":  http.StatusInternalServerError,
		"message": "Internal Server Error",
		"error": gin.H{
			"code":    constants.InternalServerErrorCode,
			"message": "Internal Server Error",
			"details": gin.H{},
		},
	}
}

// creates error response with meta and formats it correctly
func ErrorResponseWithMeta(
	status int,
	message string,
	code string,
	codeMessage string,
	codeDetailsOptions gin.H,
	meta gin.H,
) gin.H {
	return gin.H{
		"status":  status,
		"message": message,
		"error": gin.H{
			"code":    code,
			"message": codeMessage,
			"details": codeDetailsOptions,
		},
		"meta": meta,
	}
}

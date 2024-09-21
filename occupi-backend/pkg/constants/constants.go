package constants

const (
	InvalidRequestPayloadCode = "INVALID_REQUEST_PAYLOAD"
	BadRequestCode            = "BAD_REQUEST"
	InvalidAuthCode           = "INVALID_AUTH"
	IncompleteAuthCode        = "INCOMPLETE_AUTH"
	InternalServerErrorCode   = "INTERNAL_SERVER_ERROR"
	UnAuthorizedCode          = "UNAUTHORIZED"
	RequestEntityTooLargeCode = "REQUEST_ENTITY_TOO_LARGE"
	ForbiddenCode             = "FORBIDDEN"
	TooManyRequestsCode       = "TOO_MANY_REQUESTS"
	Admin                     = "admin"
	Basic                     = "basic"
	AdminDBAccessOption       = "authSource=admin"
	EmailsSentLimit           = 50
	RecipientsLimit           = 10
	RateLimitCode             = "RATE_LIMIT"
	TwoFAEnabledEmail         = "twoFAEnabled"
	VerifyEmail               = "verifyEmail"
	ReverifyEmail             = "reverifyEmail"
	ResetPassword             = "resetPassword"
	ChangePassword            = "changePassword"
	ChangeEmail               = "changeEmail"
	ConfirmIPAddress          = "confirmIPAddress"
	Off                       = "off"
	On                        = "on"
	ThumbnailRes              = "thumbnail"
	LowRes                    = "low"
	MidRes                    = "mid"
	HighRes                   = "high"
	ThumbnailWidth            = 200
	LowWidth                  = 600
	MidWidth                  = 1200
	HighWidth                 = 2000
)

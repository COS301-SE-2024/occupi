package constants

const (
	InvalidRequestPayloadCode = "INVALID_REQUEST_PAYLOAD"
	BadRequestCode            = "BAD_REQUEST"
	InvalidAuthCode           = "INVALID_AUTH"
	IncompleteAuthCode        = "INCOMPLETE_AUTH"
	InternalServerErrorCode   = "INTERNAL_SERVER_ERROR"
	UnAuthorizedCode          = "UNAUTHORIZED"
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
)

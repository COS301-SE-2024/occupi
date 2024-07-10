package main

import (
    "fmt"
    expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

func main() {
    // To check the token is valid
    pushToken, err := expo.NewExponentPushToken("ExponentPushToken[5cpRYINQu42bhcKM5b7Vsb]")
    if err != nil {
        panic(err)
    }

    // Create a new Expo SDK client
    client := expo.NewPushClient(nil)

    // Publish message
    response, err := client.Publish(
        &expo.PushMessage{
            To: []expo.ExponentPushToken{pushToken},
            Body: "This is a test notification",
            Data: map[string]string{"withSome": "data"},
            Sound: "default",
            Title: "Notification Title",
            Priority: expo.DefaultPriority,
        },
    )
    
    // Check errors
    if err != nil {
        panic(err)
    }
    
    // Validate responses
    if response.ValidateResponse() != nil {
        fmt.Println(response.PushMessage.To, "failed")
    }
}
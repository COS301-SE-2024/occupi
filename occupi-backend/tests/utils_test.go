package tests

import (
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func TestGenEmpID(t *testing.T) {
	empID, err := utils.GenerateEmployeeID()
	if err != nil {
		t.Errorf("Error generating employee ID: %s", err)
		return
	}
	t.Logf("Generated Employee ID: %s", empID)
}

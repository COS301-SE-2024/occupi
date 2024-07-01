package utils

import (
	"fmt"
	"reflect"
)

// create pagination function
type PagiOption func(*Pagination)

type Pagination struct {
	Current  int         `json:"current"`
	PageSize int         `json:"page_size"`
	Total    int         `json:"total"`
	Result   interface{} `json:"result"`
	// default paging parameter
	defaultCurrent  int
	defaultPageSize int
}

func getDefaultPagination() *Pagination {
	return &Pagination{
		defaultCurrent:  1,
		defaultPageSize: 10,
	}
}

func NewPagination(options ...PagiOption) *Pagination {
	pagination := getDefaultPagination()
	for _, option := range options {
		option(pagination)
	}
	if pagination.Current <= 0 {
		pagination.Current = pagination.defaultCurrent
	}
	if pagination.PageSize <= 0 {
		pagination.PageSize = pagination.defaultPageSize
	}
	return pagination
}

func withCurrent(current int) PagiOption {
	return func(pagination *Pagination) {
		pagination.Current = current
	}
}

func withPageSize(pageSize int) PagiOption {
	return func(pagination *Pagination) {
		pagination.PageSize = pageSize
	}
}

// Get the object after paging
func (p *Pagination) Paginate(items interface{}) error {
	value := reflect.ValueOf(items)
	if value.Kind() != reflect.Slice {
		return fmt.Errorf("Failed to create pagination")
	}
	total := value.Len()
	p.Total = total
	start := (p.Current - 1) * p.PageSize
	if start >= total {
		start = total
	}
	end := start + p.PageSize
	if end > total {
		end = total
	}
	pagedItem := value.Slice(start, end).Interface()
	p.Result = pagedItem
	return nil
}

func Paginate(items interface{}, current, pageSize int) (*Pagination, error) {
	pagination := NewPagination(
		withCurrent(current),
		withPageSize(pageSize),
	)
	err := pagination.Paginate(items)
	if err != nil {
		return nil, err
	}
	return pagination, nil
}

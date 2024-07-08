import { expect, test } from "bun:test";
import { columns, users, statusOptions } from "./Data"; // Adjust the import path as necessary

// Test the structure and integrity of columns
test("columns array structure and properties", () => {
    expect(columns).toBeInstanceOf(Array);
    expect(columns).toHaveLength(8);
  
    columns.forEach(column => {
      expect(column).toBeObject();
      expect(column).toHaveProperty("name");
      expect(column).toHaveProperty("uid");
      expect(column.name).toBeString();
      expect(column.uid).toBeString();
    });
  
    expect(columns).toContainEqual({name: "ID", uid: "id", sortable: true});
    expect(columns).toContainEqual({name: "NAME", uid: "name", sortable: true});
    expect(columns).toContainEqual({name: "ROLE", uid: "role", sortable: true});
    expect(columns).toContainEqual({name: "TEAM", uid: "team"});
    expect(columns).toContainEqual({name: "EMAIL", uid: "email"});
    expect(columns).toContainEqual({name: "STATUS", uid: "status", sortable: true});
    expect(columns).toContainEqual({name: "ACTIONS", uid: "actions"});
    expect(columns).toContainEqual({name:"BOOKINGS THIS WEEK", uid:"bookings", sortable: true});
  
    const sortableColumns = columns.filter(column => column.sortable === true);
    expect(sortableColumns).toHaveLength(5);
  
    const nonSortableColumns = columns.filter(column => column.sortable !== true);
    expect(nonSortableColumns).toHaveLength(3);
  });
// Test the integrity and structure of users
test("users array has the correct structure and content", () => {
  expect(users.length).toBe(20);
  users.forEach((user: { id: number; name: string; role: string; team: string; status:string; email:string; bookings: number; }) => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('team');
    expect(user).toHaveProperty('status');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('bookings');
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.role).toBe('string');
    expect(typeof user.team).toBe('string');
    expect(typeof user.status).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.bookings).toBe('number');
  });
});

// Test the integrity and structure of statusOptions
test("statusOptions array has the correct entries", () => {
  expect(statusOptions.length).toBe(3);
  statusOptions.forEach((option: { name: string; uid: string; }) => {
    expect(option).toHaveProperty('name');
    expect(option).toHaveProperty('uid');
    expect(typeof option.name).toBe('string');
    expect(typeof option.uid).toBe('string');
  });
});
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

const UsersTable = ({ users }) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user._id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.role}
                  color={user.role === 'admin' ? 'primary' : 'default'}
                />
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default UsersTable; 
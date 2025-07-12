// import React, { useState } from 'react';
import {useState} from "preact/compat";
import { Drawer, Button } from '@mantine/core';

export default function BasicDrawer() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open drawer</Button>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Basic Drawer"
        padding="md"
        size="md"
      >
        <div>Content inside the drawer</div>
      </Drawer>
    </>
  );
}
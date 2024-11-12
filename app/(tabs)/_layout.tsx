import React, { useState } from 'react';
import {Tabs} from "expo-router"

const TabsLayout  = () => {

    return (
        <Tabs>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="users/[id]" />
        </Tabs>
    );
};

export default TabsLayout;
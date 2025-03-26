"use client"

import { Button } from "@/components/ui/button";
import HELPER from "@/helper/helper";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false);


  useEffect(()=>{
    HELPER.Axios('POST', 'api/auth/logout').then(res => {
      if(res.success) router.replace('/login')
    })
  }, [])
  return (
    
    <Button variant="outline" size="default" onClick={async()=>{
      HELPER.Axios('POST', 'api/auth/logout').then(res => {
        if(res.success) router.replace('/login')
      })
    }}
    >
      logout
    </Button>

  );
}

'use client'
import React, { useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Nav_pv: React.FC = () => {
  let router = usePathname()
  let nav = useRouter()

  useEffect(() => {
    let itm_1 = () => {
      const elements = document.querySelectorAll<HTMLElement>('.sapAnim');
      let body = document.querySelector<HTMLElement>('body')

      elements.forEach(element => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 40,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scale: 1,
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
              end: 'top 50%',
              scrub: true,
            },
          }
        );
      });
    }

    let itm_2 = () => {
      const elements = document.querySelectorAll<HTMLElement>('.scls');
      let body = document.querySelector<HTMLElement>('body')

      elements.forEach(element => {
        gsap.fromTo(
          element,
          {
            scale: .80,
            border: `3px solid var(--border)`
          },
          {
            duration: 1,
            scale: 1,
            border: `none`,
            scrollTrigger: {
              trigger: element,
              start: 'top 70%',
              end: 'top 10%',
              scrub: true,
            },
          }
        );
      });
    }
    // console.log(router)
    if (router === '/' || router.includes('/#')) {
      itm_1()
      itm_2()
    }
  }, [router]);

  let handleCK = (name: any) => {
    if (window.location.href.endsWith(`/`)) {
      let qs = document.querySelector(`#${name}`)
      if (qs) {
        qs.scrollIntoView({
          behavior: 'smooth'
        })
        qs.classList.add(`show_h`)
        setTimeout(() => {
          qs.classList.remove(`show_h`)
        }, 2000)
      }
    }
    else {
      nav.push(`../#${name}`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <i className="bi bi-list text-5xl" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={` z-[10000000000] bg-[var(--basebg)] text-[var(--color)] brd shadow-lg mr-10`}>
          <DropdownMenuItem onClick={e => handleCK(`home`)} className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
            <i className="bi bi-house" />
            <span>Home</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={e => handleCK(`about`)} className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
            <i className="bi bi-person" />
            <span>About Me</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={e => handleCK(`experience`)} className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
            <i className="bi bi-clock-history" />
            <span>Experience</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={e => handleCK(`project`)} className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
            <i className="bi bi-stack" />
            <span>Projects</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={e => handleCK(`contact`)} className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
            <i className="bi bi-person-rolodex" />
            <span>Contact</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className=' bg-[var(--mainBg)]' />

          <Link href={`../PJ`}>
            <DropdownMenuItem className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
              <i className="bi bi-list-task" />
              <span>All Projects</span>
            </DropdownMenuItem>
          </Link>
          <Link target={`_blank`} href={`https://github.com/Shaku-Med/pfolio`}>
            <DropdownMenuItem className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
              <i className="bi bi-code" />
              <span>Source Code</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className=' bg-[var(--mainBg)]' />

          <Link target={`_blank`} href={`https://medzyp.vercel.app`}>
            <DropdownMenuItem className={` hovS hover:bg-[var(--dim)] cursor-pointer flex items-center justify-start gap-2`}>
              <i className="bi bi-hourglass-split" />
              <span>See Version (1)</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
};

export default Nav_pv

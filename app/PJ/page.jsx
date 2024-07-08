import React from 'react'
import Data from './Data'
import Link from 'next/link';

export const metadata = {
  title: `All Project || Medzy Amara`,
  description: `This page includes 60% of my finished projects with their access links iincluded.`,
  openGraph: {
    description: "This page includes 60% of my finished projects with their access links iincluded.",
    title: "All Project || Medzy Amara",
  },
}

const page = () => {
  return (
    <>
      <div className="hMbd w-full pb-10 h-full fixed top-0 left-0 overflow-x-hidden overflow-y-auto">
        <div className={`profHm  relative bd pt-5 px-2 flex items-center justify-between flex-col overflow-hidden`}>
          <div className={`MlTpt w-full h-full`}>
            <h1 className={` text-center sapAnim text-[var(--txt)] text-4xl font-bold p-4 capitalize mt-2 mb-2`}>
              All Projects
            </h1>
          </div>
        </div>
        {
          Data().length > 0 && (
            <>
              {
                (Data() || []).map((v, k) => {
                  return (
                    <div key={k} className="proj_h select-text">
                      <div className="item_holf p-4 capitalize text-xl opacity-[.8]">
                        {v.title}
                      </div>
                      <div className="grid_item px-7">
                        {
                          v.data && (
                            <>
                              {
                                (v.data || []).map((val, key) => {
                                  return (
                                    <div key={key} className="g_itm_h shadow-lg rounded-lg bg-[var(--mainBg)] brd p-2 flex items-center w-full justify-between">
                                      <div className="left_title_d">
                                        <div className="title_h text-lg">
                                          {val.name}
                                        </div>
                                        {
                                          val.search && (
                                            <div className="srch text-sm">
                                              Search: {val.search}
                                            </div>
                                          )
                                        }
                                        {
                                          val.info && (
                                            <div className="srch text-sm">
                                              info: {val.info}
                                            </div>
                                          )
                                        }
                                        <div className="link_s txt text-sm">
                                          <Link target={`_blank`} href={val.link}>
                                            {val.link}
                                          </Link>
                                        </div>
                                      </div>
                                      <Link target={`_blank`} href={val.link} className="openIc txt min-w-[50px] flex h-[50px] items-center justify-center bg-[var(--basebg)]">
                                        <i className="bi bi-box-arrow-up-right" />
                                      </Link>
                                    </div>
                                  )
                                })
                              }
                            </>
                          )
                        }
                      </div>
                    </div>
                  )
                })
              }
            </>
          )
        }
      </div>
    </>
  )
};

export default page

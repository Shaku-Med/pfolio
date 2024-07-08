import Link from 'next/link';
import Ac from './Ac';
import Blog from './Blog';
import Info from './Info';

let fnc = async (featured, id, projects) => {
    try {
        let ft = await fetch(`https://medzyamara.com/featured.json`, { cache: `no-store` });
        let dt = await ft.json();
        if (dt) {
            if (featured) {
                if (id) {
                    id = parseInt(id);
                    let flt = dt.find(v => v.id === id && v.featured);
                    if (flt) {
                        return [flt];
                    } else {
                        return [];
                    }
                } else {
                    return dt.filter(v => v.featured).sort((a, b) => a.ranking - b.ranking);
                }
            } else {
                return []
            }
        } else {
            return [];
        }
    } catch {
        return [];
    }
};

const FeaturedComponent = async ({ featured, id, projects }) => {
    let data = await fnc(featured, id, projects);

    return (
        <>
            {data && (
                <>
                    {data.length > 0 ? (
                        <>
                            {(data || []).map((v, k) => {
                                return (
                                    <div key={k}>
                                        {id ? (
                                            <Blog v={v} />
                                        ) : (
                                            <div className={`btD sapAnim id_${v.id} bd p-10 w-full max-[600px]:p-4`}>
                                                <div className={`built_one max-[800px]:shadow-lg rounded-xl relative w-full h-full max-[800px]:p-0 p-4 flex items-center justify-start max-[800px]:flex-co ${v.position === 'right' ? `` : `flex-row-reverse`}`}>
                                                    <div className={`top-0 z-[10000000] right-0 w-full max-[800px]:absolute flex items-center h-full p-2 max-[800px]:px-10 addbgS`}>
                                                        <div className={`sig_itm_lft z-[100000000000] w-full gap-2 flex ${v.position !== 'right' ? `items-end` : ``} justify-between flex-col h-fit max-[800px]:h-full max-[800px]:items-start`}>
                                                            <div className={`fir_st z-[100000000000] ${v.position !== 'right' ? `text-end` : ``} max-[800px]:text-start w-full`}>
                                                                {v.featured ? (
                                                                    <div className={`smallG_t text-sm txt ${v.position === 'right' ? `` : ``} gap-2 p-1 w-full`}>
                                                                        <span>🌟 Featured Project</span>
                                                                        (<span>{k + 1}</span>)
                                                                    </div>
                                                                ) : (
                                                                    ``
                                                                )}
                                                                <Link href={`../Featured/${v.id}`} className={`title_h line-clamp-1 hover:text-[var(--txt)] text-5xl font-bold`}>
                                                                    {v.title}
                                                                </Link>
                                                            </div>
                                                            <div className={`inf_h min-w-[150%] max-[800px]:min-w-full ${v.position !== 'right' ? `text-end` : ``} text-lg max-[800px]:text-start shadow-lg bg-[var(--mainBg)] max-[800px]:bg-transparent max-[800px]:shadow-none p-2 rounded-md max-[800px]:rounded-none max-w-[100%] max-[800px]:max-w-full`}>
                                                                {v.description}
                                                            </div>
                                                            <div className={`info_about z-[10000000000000] w-fit ${v.position !== 'right' ? `text-end` : ``} max-[800px]:text-start`}>
                                                                <div className={`langU p-2 text-lg flex ${v.position !== 'right' ? `items-end` : ``} max-[800px]:items-start gap-2`}>
                                                                    {(v.languages || []).slice(0, 3).map((val, key) => {
                                                                        return (
                                                                            <span key={key}>{val}{key < v.languages.length - 1 ? ',' : ''}</span>
                                                                        );
                                                                    })}
                                                                    {v.languages && v.languages.length > 4 && (
                                                                        <Link className={`txt cursor-pointer hover:underline`} href={`../Featured/${v.id}`}>More...</Link>
                                                                    )}
                                                                </div>
                                                                <div className={`access_point z-[1000000000000] flex items-center ${v.position !== 'right' ? `justify-end` : `justify-start`} max-[800px]:justify-start gap-2`}>
                                                                    {!v.code && (
                                                                        <Info v={v} />
                                                                    )}
                                                                    {v.code && (
                                                                        <Link target={`_blank`} href={`${v.code}`} className={`icc_1 cursor-pointer h-10 w-10 flex items-center justify-center brd p-2`}>
                                                                            <i className={`bi bi-code`} />
                                                                        </Link>
                                                                    )}
                                                                    {v.project && (
                                                                        <Link target={`_blank`} href={`${v.project}`} className={`icc_1 cursor-pointer h-10 w-10 flex items-center justify-center brd p-2`}>
                                                                            <i className={`bi bi-box-arrow-up-right`} />
                                                                        </Link>
                                                                    )}
                                                                    <Link href={`../Featured/${v.id}`} className={`icc_1 cursor-pointer h-10 w-10 flex items-center justify-center brd p-2`}>
                                                                        <i className={`bi bi-link`} />
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Ac v={v} />

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                                    <img className="mx-auto h-40 w-auto" src="https://medzyamara.com/favicon.ico" alt="Project not found" />
                                    <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold opacity-[.6]">
                                        Oops! Project not found
                                    </h2>
                                    <p className="mt-2 text-center text-lg leading-9 opacity-[.4]">
                                        The project you are looking for could not be found. It may have been deleted or does not exist.
                                    </p>
                                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                                        <div className="flex justify-center">
                                            <Link href="../" className="text-gray-600 hover:text-gray-800">
                                                Go back home<span aria-hidden="true"> &rarr;</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
};

FeaturedComponent.displayName = 'FeaturedComponent';

export default FeaturedComponent;

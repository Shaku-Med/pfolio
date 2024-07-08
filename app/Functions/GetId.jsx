'use client';

const getOrCreateUniqueId = async (
    hasData,
    isadd,
    isall,
    shouldadd,
    isDelete
) => {
    try {
        const dbRequest = indexedDB.open(
            `${hasData ? hasData.db : 'deviceIdentifierDB'}`,
            1
        );

        return new Promise((resolve, reject) => {
            dbRequest.onupgradeneeded = event => {
                const db = event.target.result;
                db.createObjectStore(
                    `${hasData
                        ? hasData.name
                        : 'deviceIdentifierStore'
                    }`,
                    { keyPath: 'id' }
                );
            };

            dbRequest.onsuccess = event => {
                const db = event.target.result;
                const transaction = db.transaction(
                    `${hasData
                        ? hasData.name
                        : 'deviceIdentifierStore'
                    }`,
                    'readwrite'
                );
                const store = transaction.objectStore(
                    `${hasData
                        ? hasData.name
                        : 'deviceIdentifierStore'
                    }`
                );

                if (isDelete) {
                    const deleteRequest = store.delete(
                        `${hasData ? hasData.id : 'deviceId'}`
                    );
                    deleteRequest.onsuccess = () => {
                        resolve(`Deleted record with ID: ${hasData ? hasData.id : 'deviceId'}`);
                    };
                    deleteRequest.onerror = () => {
                        reject('Failed to delete device ID');
                    };
                } else if (!isall) {
                    const getRequest = store.get(
                        `${hasData ? hasData.id : 'deviceId'}`
                    );
                    getRequest.onsuccess = () => {
                        let uniqueId = getRequest.result
                            ? getRequest.result.value
                            : null;
                        resolve(uniqueId);
                    };

                    getRequest.onerror = () => {
                        reject('Failed to retrieve data');
                    };
                } else {
                    let data = [];
                    store.openCursor().onsuccess = event => {
                        const cursor = event.target.result;
                        if (cursor) {
                            data.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(data);
                        }
                    };
                }
            };

            dbRequest.onerror = () => {
                reject('Failed to open IndexedDB');
            };
        });
    } catch (error) {
        console.error('Error in getOrCreateUniqueId:', error);
    }
};

export default getOrCreateUniqueId;
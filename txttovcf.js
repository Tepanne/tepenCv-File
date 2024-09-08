document.getElementById('processFilesBtn').addEventListener('click', function() {
    const files = document.getElementById('file-input').files;
    const splitContacts = document.querySelector('input[name="splitContacts"]:checked').value;
    const globalAdminName = prompt('Masukkan nama untuk Admin', 'Admin') || 'Admin';
    const globalNavyName = prompt('Masukkan nama untuk Navy', 'Navy') || 'Navy';
    const globalAnggotaName = prompt('Masukkan nama untuk Anggota', 'Anggota') || 'Anggota';

    const fileAreas = document.getElementById('file-areas');
    fileAreas.innerHTML = ''; // Kosongkan area file sebelum menambahkan yang baru

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const textContent = e.target.result;
            const lines = textContent.split('\n').map(line => line.trim());
            const originalFilename = file.name.split('.').shift();

            // Membuat elemen untuk setiap file
            const fileDiv = document.createElement('div');
            fileDiv.classList.add('file-container');

            const fileNameLabel = document.createElement('label');
            fileNameLabel.textContent = `Nama File Asal: ${file.name}`;
            fileNameLabel.classList.add('file-name-label');

            const fileNameInput = document.createElement('input');
            fileNameInput.type = 'text';
            fileNameInput.placeholder = 'Masukkan nama file VCF';
            fileNameInput.classList.add('file-name-input');

            const generateButton = document.createElement('button');
            generateButton.textContent = 'Generate VCF';
            generateButton.classList.add('generate-vcf-btn');
            generateButton.addEventListener('click', () => {
                const filename = fileNameInput.value.trim() || originalFilename;
                let vcfContentAdminNavy = '';
                let vcfContentAnggota = '';
                let currentCategory = '';
                let contactIndex = 1;

                lines.forEach(line => {
                    const lowerCaseLine = line.toLowerCase();

                    if (['admin', '管理号', '管理', '管理员', '管理號','管理号码','管理','管理号'].includes(lowerCaseLine)) {
                        currentCategory = globalAdminName;
                        contactIndex = 1;
                    } else if (['navy', '水軍', '小号', '水军', '水軍','会员号',].includes(lowerCaseLine)) {
                        currentCategory = globalNavyName;
                        contactIndex = 1;
                    } else if (['anggota', '数据', '客户', '底料', '进群资源','会员号','料子','以下是73个水军都进15个群','料子',].includes(lowerCaseLine)) {
                        currentCategory = globalAnggotaName;
                        contactIndex = 1;
                    } else if (line) {
                        let phoneNumber = line;
                        if (!phoneNumber.startsWith('+')) {
                            phoneNumber = '+' + phoneNumber;
                        }
                        const vcfEntry = `BEGIN:VCARD\nVERSION:3.0\nFN:${currentCategory} ${contactIndex}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;

                        if (currentCategory === globalAdminName || currentCategory === globalNavyName) {
                            vcfContentAdminNavy += vcfEntry;
                        } else {
                            vcfContentAnggota += vcfEntry;
                        }
                        contactIndex++;
                    }
                });

                if (splitContacts === 'ya') {
                    // Pisahkan kontak Anggota dari Admin dan Navy
                    if (vcfContentAdminNavy) {
                        const blobAdminNavy = new Blob([vcfContentAdminNavy], { type: 'text/vcard' });
                        const urlAdminNavy = URL.createObjectURL(blobAdminNavy);
                        
                        const linkAdminNavy = document.createElement('a');
                        linkAdminNavy.href = urlAdminNavy;
                        linkAdminNavy.download = `${filename}_AdminNavy.vcf`;
                        linkAdminNavy.textContent = `Download ${filename}_AdminNavy.vcf`;
                        fileDiv.appendChild(linkAdminNavy);
                    }

                    if (vcfContentAnggota) {
                        const blobAnggota = new Blob([vcfContentAnggota], { type: 'text/vcard' });
                        const urlAnggota = URL.createObjectURL(blobAnggota);

                        const linkAnggota = document.createElement('a');
                        linkAnggota.href = urlAnggota;
                        linkAnggota.download = `${filename}_Anggota.vcf`;
                        linkAnggota.textContent = `Download ${filename}_Anggota.vcf`;
                        fileDiv.appendChild(linkAnggota);
                    }
                } else {
                    // Gabungkan semua kontak menjadi satu file
                    const combinedVcfContent = vcfContentAdminNavy + vcfContentAnggota;
                    if (combinedVcfContent) {
                        const blob = new Blob([combinedVcfContent], { type: 'text/vcard' });
                        const url = URL.createObjectURL(blob);

                        const linkCombined = document.createElement('a');
                        linkCombined.href = url;
                        linkCombined.download = `${filename}.vcf`;
                        linkCombined.textContent = `Download ${filename}.vcf`;
                        fileDiv.appendChild(linkCombined);
                    }
                }
            });

            fileDiv.appendChild(fileNameLabel);
            fileDiv.appendChild(fileNameInput);
            fileDiv.appendChild(generateButton);
            fileAreas.appendChild(fileDiv);
        };
        reader.readAsText(file);
    });
});

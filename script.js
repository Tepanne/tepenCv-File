document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('#mainContent > .section');
  
    function showSection(targetId) {
      sections.forEach(section => {
        section.style.display = section.id === targetId ? 'block' : 'none';
      });
    }
  
    // Event listener untuk navigasi
    navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('data-target');
        showSection(targetId);
      });
    });
  
    // Menampilkan bagian default
    showSection('convertTxtToVcf');
  
    // Daftar putih (Whitelist)
    const whitelist = {
      'topa12dewa': 'User1',
      'ca1915': 'User2',
    };
  
    function isWhitelisted(keyword) {
      return whitelist.hasOwnProperty(keyword);
    }
  
    // Event listener untuk input file TXT
    document.getElementById('txtFileInput').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          document.getElementById('txtContentBox').value = content;
        };
        reader.readAsText(file);
      }
    });
  
    // Konversi TXT ke VCF
    document.getElementById('convertTxtToVcfButton').addEventListener('click', function() {
      const txtContent = document.getElementById('txtContentBox').value.trim();
      const adminName = document.getElementById('adminNameInput').value.trim() || 'Admin';
      const navyName = document.getElementById('navyNameInput').value.trim() || 'Navy';
      const anggotaName = document.getElementById('anggotaNameInput').value.trim() || 'Anggota';
      const filename = document.getElementById('vcfFilenameInput').value.trim() || 'kontak';
      const buatFileAdmin = document.querySelector('input[name="buatFileAdmin"]:checked').value;
  
      if (!txtContent) {
        alert('Isi textarea tidak boleh kosong!');
        return;
      }
  
      const lines = txtContent.split('\n').map(line => line.trim());
      let vcfContentAdminNavy = '';
      let vcfContentAnggota = '';
      let currentCategory = '';
      let contactIndex = 1;
  
      lines.forEach(line => {
          const lowerCaseLine = line.toLowerCase();
  
          if (['admin', '管理号', '管理', '管理员', '管理號'].includes(lowerCaseLine)) {
              currentCategory = adminName;
              contactIndex = 1;
          } else if (['navy', '水軍', '小号', '水军', '水軍'].includes(lowerCaseLine)) {
              currentCategory = navyName;
              contactIndex = 1;
          } else if (['anggota', '数据', '客户', '底料', '进群资源'].includes(lowerCaseLine)) {
              currentCategory = anggotaName;
              contactIndex = 1;
          } else if (line) {
              let phoneNumber = line;
              if (!phoneNumber.startsWith('+')) {
                  phoneNumber = '+' + phoneNumber;
              }
              const vcfEntry = `BEGIN:VCARD\nVERSION:3.0\nFN:${currentCategory} ${contactIndex}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;
  
              if (currentCategory === adminName || currentCategory === navyName) {
                  vcfContentAdminNavy += vcfEntry;
              } else {
                  vcfContentAnggota += vcfEntry;
              }
              contactIndex++;
          }
      });
  
      if (buatFileAdmin === 'ya') {
          if (vcfContentAdminNavy) {
              const blobAdminNavy = new Blob([vcfContentAdminNavy], { type: 'text/vcard' });
              const urlAdminNavy = URL.createObjectURL(blobAdminNavy);
              const aAdminNavy = document.createElement('a');
              aAdminNavy.href = urlAdminNavy;
              aAdminNavy.download = `${filename}_Admin.vcf`;
              aAdminNavy.click();
              URL.revokeObjectURL(urlAdminNavy);
          }
  
          if (vcfContentAnggota) {
              const blobAnggota = new Blob([vcfContentAnggota], { type: 'text/vcard' });
              const urlAnggota = URL.createObjectURL(blobAnggota);
              const aAnggota = document.createElement('a');
              aAnggota.href = urlAnggota;
              aAnggota.download = `${filename}.vcf`;
              aAnggota.click();
              URL.revokeObjectURL(urlAnggota);
          }
      } else {
          const blob = new Blob([vcfContentAdminNavy + vcfContentAnggota], { type: 'text/vcard' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.vcf`;
          a.click();
          URL.revokeObjectURL(url);
      }
    });
  
    // Proses file XLSX
    document.getElementById('fileInput').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const cleanedRows = removeEmptyColumns(rows);
          const transposed = transpose(cleanedRows);
          const text = transposed.map(row => row.join('\n')).join('\n\n');
          document.getElementById('textBox').value = text;
        };
        reader.readAsBinaryString(file);
      }
    });
  
    function removeEmptyColumns(rows) {
      if (rows.length === 0) return rows;
  
      const columnCount = rows[0].length;
      const nonEmptyColumnIndices = new Set();
  
      // Menentukan indeks kolom yang tidak kosong
      for (let row of rows) {
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
          if (row[colIndex] !== undefined && row[colIndex] !== null && row[colIndex] !== '') {
            nonEmptyColumnIndices.add(colIndex);
          }
        }
      }
  
      // Menghapus kolom kosong
      return rows.map(row => {
        return row.filter((_, colIndex) => nonEmptyColumnIndices.has(colIndex));
      });
    }
  
    function transpose(matrix) {
      return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
  
    // Simpan file TXT
    document.getElementById('saveBtn').addEventListener('click', function() {
      const text = document.getElementById('textBox').value;
      const filename = document.getElementById('filenameInput').value || 'file.txt';
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  
    // Proses banyak file TXT ke VCF
    document.getElementById('processFilesBtn').addEventListener('click', function() {
      const files = document.getElementById('file-input').files;
      const fileAreas = document.getElementById('file-areas');
      const contactName = document.getElementById('contactNameInput').value.trim() || 'Contact';
  
      fileAreas.innerHTML = ''; // Kosongkan div sebelum menambahkan textarea baru
  
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const textArea = document.createElement('textarea');
          textArea.classList.add('small-textarea');
          textArea.value = e.target.result;
  
          const fileNameInput = document.createElement('input');
          fileNameInput.type = 'text';
          fileNameInput.placeholder = 'Masukkan nama file VCF';
          fileNameInput.classList.add('file-name-input');
  
          const fileNameLabel = document.createElement('label');
          fileNameLabel.textContent = `Nama File Asal: ${file.name}`;
          fileNameLabel.classList.add('file-name-label');
  
          const generateButton = document.createElement('button');
          generateButton.textContent = 'Generate VCF';
          generateButton.classList.add('generate-vcf-btn');
          generateButton.addEventListener('click', () => {
            const lines = textArea.value.split('\n').map(line => line.trim());
            const filename = fileNameInput.value.trim() || 'contacts';
            let vcfContent = '';
            let contactIndex = 1;
  
            lines.forEach(line => {
              if (line) {
                let phoneNumber = line;
                if (!phoneNumber.startsWith('+')) {
                  phoneNumber = '+' + phoneNumber;
                }
                vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName} ${contactIndex}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;
                contactIndex++;
              }
            });
  
            const blob = new Blob([vcfContent], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename + '.vcf';
            a.click();
            URL.revokeObjectURL(url);
          });
  
          const container = document.createElement('div');
          container.classList.add('file-container');
          container.appendChild(fileNameLabel);
          container.appendChild(fileNameInput);
          container.appendChild(textArea);
          container.appendChild(generateButton);
  
          fileAreas.appendChild(container);
        };
        reader.readAsText(file);
      });
    });
  });
  
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

// Definição de fontes padrão do pdfmake (usando Roboto)
const fonts = {
	Roboto: {
		normal: 'Helvetica',
		bold: 'Helvetica-Bold',
		italics: 'Helvetica-Oblique',
		bolditalics: 'Helvetica-BoldOblique',
	},
};

const printer = new PdfPrinter(fonts);

/**
 * Helper para salvar o PDF
 */
const savePdf = (docDefinition, filename) => {
	return new Promise((resolve, reject) => {
		const dir = path.join(__dirname, '../../../uploads/gepro/documentos');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		const filePath = path.join(dir, filename);
		const pdfDoc = printer.createPdfKitDocument(docDefinition);
		const writeStream = fs.createWriteStream(filePath);
		
		pdfDoc.pipe(writeStream);
		pdfDoc.end();

		writeStream.on('finish', () => resolve(filePath));
		writeStream.on('error', reject);
	});
};

/**
 * Gera PDF do Estudo Técnico Preliminar (ETP)
 */
exports.gerarPDF_ETP = async (demanda, etp) => {
	const docDefinition = {
		content: [
			{ text: 'ESTUDO TÉCNICO PRELIMINAR - ETP', style: 'header' },
			{ text: `Demanda: ${demanda.numero_demanda} - ${demanda.titulo}`, style: 'subheader' },
			{ text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 0, 0, 20] },
			
			{ text: '1. DESCRIÇÃO DA NECESSIDADE', style: 'sectionHeader' },
			{ text: demanda.descricao || 'Não informado.', style: 'bodyText' },
			
			{ text: '2. JUSTIFICATIVA TÉCNICA', style: 'sectionHeader' },
			{ text: etp.justificativa_tecnica || 'Não informado.', style: 'bodyText' },
			
			{ text: '3. CATEGORIA DO EQUIPAMENTO E REQUISITOS', style: 'sectionHeader' },
			{ text: `Categoria: ${etp.categoria_equipamento || 'N/A'}\nProcessador: ${etp.processador_tipo || 'N/A'}\nMemória RAM: ${etp.memoria_ram_minima || 'N/A'}\nArmazenamento: ${etp.armazenamento_tipo} ${etp.armazenamento_capacidade}\n\nConectividade: ${etp.conectividade || 'N/A'}`, style: 'bodyText' },
			
			{ text: '4. ESTIMATIVA DE QUANTIDADES', style: 'sectionHeader' },
			{ text: etp.estimativa_quantidades || `Quantidade Demandada: ${demanda.quantidade}`, style: 'bodyText' },

			{ text: '5. JUSTIFICATIVA PARA PARCELAMENTO', style: 'sectionHeader' },
			{ text: etp.justificativa_parcelamento || 'Não informado.', style: 'bodyText' },

			{ text: '6. CRITÉRIOS DE REJEIÇÃO', style: 'sectionHeader' },
			{ text: etp.criterios_rejeicao || 'Não informado.', style: 'bodyText' },

			{ text: '7. POSICIONAMENTO CONCLUSIVO SOBRE A VIABILIDADE', style: 'sectionHeader' },
			{ text: etp.posicionamento_conclusivo || 'Não informado.', style: 'bodyText' }
		],
		styles: {
			header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
			subheader: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
			sectionHeader: { fontSize: 12, bold: true, margin: [0, 15, 0, 5], color: '#333333' },
			bodyText: { fontSize: 11, alignment: 'justify', margin: [0, 0, 0, 10] },
		},
		defaultStyle: { font: 'Roboto' }
	};

	const filename = `ETP_${demanda.numero_demanda}_${Date.now()}.pdf`.replace(/\//g, '-');
	const filePath = await savePdf(docDefinition, filename);
	return { filename, filePath };
};

/**
 * Gera PDF do Termo de Referência (TR)
 */
exports.gerarPDF_TR = async (demanda, tr) => {
	const docDefinition = {
		content: [
			{ text: 'TERMO DE REFERÊNCIA - TR', style: 'header' },
			{ text: `Demanda: ${demanda.numero_demanda} - ${demanda.titulo}`, style: 'subheader' },
			{ text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 0, 0, 20] },
			
			{ text: '1. DO OBJETO', style: 'sectionHeader' },
			{ text: tr.objeto || 'Não informado.', style: 'bodyText' },
			
			{ text: '2. JUSTIFICATIVA E OBJETIVO DA CONTRATAÇÃO', style: 'sectionHeader' },
			{ text: tr.justificativa || 'Não informado.', style: 'bodyText' },
			
			{ text: '3. ESPECIFICAÇÃO TÉCNICA E DESCRIÇÃO DETALHADA', style: 'sectionHeader' },
			{ text: tr.descricao_detalhada || 'Não informado.', style: 'bodyText' },
			
			{ text: '4. MODELO DE EXECUÇÃO DO OBJETO', style: 'sectionHeader' },
			{ text: tr.modelo_execucao_objeto || 'Não informado.', style: 'bodyText' },

			{ text: '5. MODELO DE GESTÃO DO CONTRATO E MEDIÇÃO', style: 'sectionHeader' },
			{ text: `Modelo de Gestão:\n${tr.modelo_gestao_contrato || 'N/A'}\n\nCritérios de Medição e Pagamento:\n${tr.criterios_medicao_pagamento || 'N/A'}`, style: 'bodyText' },

			{ text: '6. PRAZOS, GARANTIA E CONDIÇÕES DE PAGAMENTO', style: 'sectionHeader' },
			{ text: `Prazo Máximo de Entrega: ${tr.prazo_entrega_dias_max || 'N/A'} dias.\nPrazo de Garantia: ${tr.prazo_garantia_meses || 'N/A'} meses.\nCondições de Pagamento: ${tr.condicoes_pagamento || 'N/A'}`, style: 'bodyText' },

			{ text: '7. ÓRGÃOS PARTICIPANTES E LOCAIS DE ENTREGA', style: 'sectionHeader' },
			{ text: `Órgãos Participantes:\n${tr.orgaos_participantes || 'N/A'}\n\nLocais de Entrega:\n${tr.enderecos_entrega || 'N/A'}`, style: 'bodyText' },

			{ text: '8. PROVA DE CONCEITO', style: 'sectionHeader' },
			{ text: tr.requisitos_prova_conceito || 'Não se aplica.', style: 'bodyText' }
		],
		styles: {
			header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
			subheader: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
			sectionHeader: { fontSize: 12, bold: true, margin: [0, 15, 0, 5], color: '#333333' },
			bodyText: { fontSize: 11, alignment: 'justify', margin: [0, 0, 0, 10] },
		},
		defaultStyle: { font: 'Roboto' }
	};

	const filename = `TR_${demanda.numero_demanda}_${Date.now()}.pdf`.replace(/\//g, '-');
	const filePath = await savePdf(docDefinition, filename);
	return { filename, filePath };
};

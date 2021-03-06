'use strict';

import { workspace, window, commands, ExtensionContext } from 'vscode';
import { AsmProvider, encodeAsmUri } from './provider';
import { AsmDecorator } from './decorator';

export function activate(context: ExtensionContext) {
    const provider = new AsmProvider();

    // register content provider for scheme `disassembly`
    const providerRegistration =
        workspace.registerTextDocumentContentProvider(AsmProvider.scheme, provider);

    // register command that crafts an uri with the `disassembly` scheme,
    // open the dynamic document, and shows it in the next editor
    const commandRegistration = commands.registerTextEditorCommand('disasexpl.show', srcEditor => {
        let asmUri = encodeAsmUri(srcEditor.document.uri);

        workspace.openTextDocument(asmUri).then(doc => {
            window.showTextDocument(doc, srcEditor.viewColumn! + 1, true).then(asmEditor => {
                const decorator = new AsmDecorator(srcEditor, asmEditor, provider);
                // dirty way to get decorations work after showing disassembly
                setTimeout(_ => decorator.updateSelection(srcEditor), 500);
            });
        });
    });

    context.subscriptions.push(
        provider,
        commandRegistration,
        providerRegistration
    );
}

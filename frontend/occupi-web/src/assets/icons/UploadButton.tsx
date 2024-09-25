import { Button, ButtonProps } from '@nextui-org/react';
import { useCallback, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const isAllFiles = (dt: DataTransfer) =>
	dt.types.every(t => t === 'Files' || t === 'application/x-moz-file');

const doesAccept = (type: string, accept?: string): boolean => {
	if (!accept) {
		return true;
	}

	const acceptList = accept.split(',').map(c => c.trim());
	let cond = false;
	for (const acceptor of acceptList) {
		if (acceptor.endsWith('*')) {
			cond ||= type.startsWith(acceptor.slice(0, -1));
		} else {
			cond ||= type === acceptor;
		}
	}
	return cond;
};

const isEventAllowed = <T extends HTMLElement>(
	e: React.DragEvent<T>,
	accept: string | undefined,
	multiple: boolean
): boolean => {
	if (!isAllFiles(e.dataTransfer)) {
		return false;
	}

	const items = Array.from(e.dataTransfer.items);
	if (items.length === 0 || (!multiple && items.length > 1)) {
		return false;
	}
	return items.every(c => doesAccept(c.type, accept));
};

interface FileUploadButtonProps extends ButtonProps {
	classNames?: {
		wrapper?: string;
		button?: string;
	};
	onUpload?: (files: File[]) => void;
	acceptProps?: ButtonProps;
	rejectProps?: ButtonProps;
	accept?: string;
	multiple?: boolean;
}

export default function FileUploadButton({
	accept,
	onUpload,
	acceptProps = { color: 'primary' },
	rejectProps = { color: 'danger' },
	multiple = false,
	classNames,
	className,
	...props
}: FileUploadButtonProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [acceptance, setAcceptance] = useState<null | 'ACCEPT' | 'REJECT'>(null);

	const onDragEnter = useCallback(
		(e: React.DragEvent<HTMLButtonElement>) => {
			if (isEventAllowed(e, accept, multiple)) {
				setAcceptance('ACCEPT');
			} else {
				setAcceptance('REJECT');
			}
		},
		[accept, multiple]
	);

	const onDragOver = useCallback(
		(e: React.DragEvent<HTMLButtonElement>) => {
			e.preventDefault();
			if (isEventAllowed(e, accept, multiple)) {
				setAcceptance('ACCEPT');
			} else {
				setAcceptance('REJECT');
			}
		},
		[accept, multiple]
	);

	const onDragFinish = useCallback(() => {
		setAcceptance(null);
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLButtonElement>) => {
			e.preventDefault();
			e.stopPropagation();

			if (isEventAllowed(e, accept, multiple)) {
				const items = Array.from(e.dataTransfer.items);
				if (items.length) {
					onUpload?.(items.map(c => c.getAsFile()!));
				}
			}

			setAcceptance(null);
		},
		[accept, multiple, onUpload]
	);

	const onFileChosen = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onUpload?.(Array.from(e.target.files!));
		},
		[onUpload]
	);

	const onButtonPress = useCallback(() => {
		inputRef.current?.click();
	}, []);

	// Create a variable to hold the conditional props
	let conditionalProps = {};
	if (acceptance === 'ACCEPT') {
		conditionalProps = acceptProps;
	} else if (acceptance === 'REJECT') {
		conditionalProps = rejectProps;
	}

	return (
		<form className={classNames?.wrapper}>
			<label htmlFor='_upload'>
				<Button
					/* middle finger to the typescript devs */
					// @ts-ignore */
					{...props}
					{...conditionalProps}
					className={twMerge(
						className,
						classNames?.button,
						acceptance === 'ACCEPT'
							? acceptProps?.className
							: acceptance === 'REJECT'
							? rejectProps?.className
							: null
					)}
					
					onPress={onButtonPress}
					onDragEnter={onDragEnter}
					onDragOver={onDragOver}
					onDragEnd={onDragFinish}
					onDragLeave={onDragFinish}
					onDrop={onDrop}
				/>
			</label>
			<input
				type='file'
				role='presentation'
				name='_upload'
				ref={inputRef}
				onChange={onFileChosen}
				accept={accept}
				multiple={multiple}
				className='hidden'
			/>
		</form>
	);
}

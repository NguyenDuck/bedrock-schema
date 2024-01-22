import { $log } from '@tsed/logger'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve, relative } from 'path'
import { Uri } from 'vscode'

$log.name = 'Bedrock Schema'

/**
 * Gets all schema file URIs under the src/schema directory.
 * Recursively explores subdirectories to find all schema files.
 * Converts file paths to URIs and returns array of URIs.
 */
export function getAllSchemas(): Uri[] {
	const rootPath = resolve(__dirname, '../src')

	let currentPath = join(rootPath, 'schema')

	function exploreFiles(name: string): string[] {
		if (name.includes('.')) {
			return [relative(rootPath, resolve(currentPath, name)).replace(/\\/g, '/')]
		} else {
			currentPath = join(currentPath, name)
			const nestedFiles = readdirSync(currentPath).flatMap(exploreFiles)
			currentPath = resolve(currentPath, '../')
			return nestedFiles
		}
	}

	return readdirSync(currentPath).flatMap(exploreFiles).flatMap(Uri.file)
}

/**
 * Gets the content of the schema file at the given path.
 * Converts the path to a URI and reads the file contents.
 * Logs an error if the file can't be read.
 */
export function getSchema(path: string): string {
	const uri = Uri.parse(path)
	try {
		return readFileSync(join(resolve(__dirname, '../src'), uri.path), 'utf-8')
	} catch (e: any) {
		let message = `when trying to import schema from ${uri.path}`
		$log.debug(e.code)

		switch (e.code) {
			case 'ENOENT':
				message = `No such file or directory ${message}`
				break
			default:
				message = `Unhandled error ${message}, ${e}`
				break
		}
		$log.error(message)
		return ''
	}
}

#!/usr/bin/env python3
"""
One-Pager - Release Management Script
Automates version bumping and release creation
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def run_command(cmd, check=True, capture_output=True):
    """Run a shell command and return the result."""
    result = subprocess.run(cmd, shell=True, check=check, capture_output=capture_output, text=True)
    return result


def get_current_version():
    """Get current version from package.json."""
    with open("package.json", "r") as f:
        package_data = json.load(f)
    return package_data["version"]


def bump_version(current_version, bump_type):
    """Bump version based on type (major, minor, patch)."""
    major, minor, patch = map(int, current_version.split("."))

    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
    else:
        raise ValueError(f"Invalid bump type: {bump_type}")


def update_package_json(new_version):
    """Update version in package.json."""
    with open("package.json", "r") as f:
        package_data = json.load(f)

    package_data["version"] = new_version

    with open("package.json", "w") as f:
        json.dump(package_data, f, indent=2)
        f.write("\n")


def generate_changelog_entry(version, changes):
    """Generate changelog entry for the new version."""
    date = datetime.now().strftime("%Y-%m-%d")
    entry = f"\n## [{version}] - {date}\n\n"

    if changes:
        for change in changes:
            entry += f"- {change}\n"
    else:
        entry += "- Version bump\n"

    return entry


def update_changelog(version, changes):
    """Update CHANGELOG.md with new version."""
    changelog_path = Path("CHANGELOG.md")

    if not changelog_path.exists():
        # Create new changelog
        content = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n"
        content += generate_changelog_entry(version, changes)
        changelog_path.write_text(content)
    else:
        # Update existing changelog
        content = changelog_path.read_text()
        entry = generate_changelog_entry(version, changes)

        # Insert after the header
        lines = content.split("\n")
        header_end = 0
        for i, line in enumerate(lines):
            if line.startswith("## "):
                header_end = i
                break

        if header_end == 0:
            # No existing entries, add after header
            for i, line in enumerate(lines):
                if line.strip() == "":
                    header_end = i
                    break

        lines.insert(header_end, entry.rstrip())
        changelog_path.write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description="Release management for One-Pager")
    parser.add_argument("bump_type", choices=["major", "minor", "patch"], help="Type of version bump")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--message", "-m", action="append", help="Changelog message (can be used multiple times)")
    parser.add_argument("--no-push", action="store_true", help="Do not push changes to remote")

    args = parser.parse_args()

    # Change to script directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    os.chdir(project_root)

    print("🚀 One-Pager Release Manager")
    print(f"{'=' * 40}")

    # Check if we're in a git repository
    try:
        run_command("git status --porcelain")
    except subprocess.CalledProcessError:
        print("❌ Not in a git repository")
        sys.exit(1)

    # Check for uncommitted changes
    result = run_command("git status --porcelain")
    if result.stdout.strip():
        print("❌ Uncommitted changes detected:")
        print(result.stdout)
        print("Please commit or stash changes before releasing.")
        sys.exit(1)

    # Get current version
    current_version = get_current_version()
    new_version = bump_version(current_version, args.bump_type)

    print(f"📦 Current version: {current_version}")
    print(f"📦 New version: {new_version}")
    print(f"📝 Bump type: {args.bump_type}")

    if args.dry_run:
        print("\n🔍 DRY RUN - No changes will be made")
        print(f"Would update package.json to version {new_version}")
        if args.message:
            print(f"Would add changelog entries: {args.message}")
        print("Would create git tag and commit")
        return

    # Run tests
    print("\n🧪 Running tests...")
    try:
        run_command("npm test", capture_output=False)
        print("✅ Tests passed")
    except subprocess.CalledProcessError:
        print("❌ Tests failed")
        sys.exit(1)

    # Run linting
    print("\n🔍 Running linter...")
    try:
        run_command("npm run lint", capture_output=False)
        print("✅ Linting passed")
    except subprocess.CalledProcessError:
        print("❌ Linting failed")
        sys.exit(1)

    # Update package.json
    print(f"\n📝 Updating package.json to version {new_version}")
    update_package_json(new_version)

    # Update changelog
    if args.message:
        print("📝 Updating CHANGELOG.md")
        update_changelog(new_version, args.message)

    # Commit changes
    commit_message = f"chore: release v{new_version}"
    print(f"\n📝 Committing changes: {commit_message}")
    run_command("git add package.json CHANGELOG.md")
    run_command(f'git commit -m "{commit_message}"')

    # Create tag
    tag_name = f"v{new_version}"
    tag_message = f"Release {new_version}"
    if args.message:
        tag_message += "\n\n" + "\n".join(f"- {msg}" for msg in args.message)

    print(f"🏷️  Creating tag: {tag_name}")
    run_command(f'git tag -a {tag_name} -m "{tag_message}"')

    # Push changes
    if not args.no_push:
        print("\n🚀 Pushing changes to remote...")
        run_command("git push origin main")
        run_command(f"git push origin {tag_name}")
        print("✅ Changes pushed to remote")
    else:
        print("\n⏸️  Skipping push (--no-push specified)")
        print(f"To push manually: git push origin main && git push origin {tag_name}")

    print(f"\n🎉 Release {new_version} completed successfully!")
    print("📋 Summary:")
    print(f"   • Version: {current_version} → {new_version}")
    print(f"   • Tag: {tag_name}")
    if args.message:
        print(f"   • Changelog entries: {len(args.message)}")


if __name__ == "__main__":
    main()
